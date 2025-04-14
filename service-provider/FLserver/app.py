from flask import Flask, jsonify, make_response
from flask import request
import pickle
import keras
from keras import utils
from keras.models import Sequential
from keras.models import load_model
from keras.layers import Dense, Activation, Dropout
from keras.layers import BatchNormalization
from keras.optimizers import Adam
from tensorflow.keras.layers import Input
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as pltn
import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize
import tensorflow as tf
import requests
import os
import time
import io
import json
from flask_cors import CORS, cross_origin

clientsResponded = []
clientUpdateId = []
clientQueue = []
logs = []
num_participants = 0
num_rounds = 1
rounds_counter = 1
global_model = None

def save_global_updates(model, additional_info=None):
    client_updates = {"weights": model.get_weights()}
    if additional_info:
        client_updates.update(additional_info)
    with open(f"global_update.pkl", "wb") as f:
        pickle.dump(client_updates, f)


def create_global_model():
    model = Sequential()
    model.add(Dense(1000, input_dim=4, activation='relu'))
    model.add(Dense(500, activation='relu'))
    model.add(Dense(300, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(3, activation='softmax'))
    model.compile(loss='categorical_crossentropy',
                  optimizer='adam', metrics=['accuracy'])
    return model


def aggregate_client_updates(client_update_files):
    all_client_weights = []
    for file_path in client_update_files:
        with open(file_path, "rb") as f:
            client_updates = pickle.load(f)
        client_weights = client_updates["weights"]
        all_client_weights.append(client_weights)
    aggregated_weights = [sum(weights) / len(weights)
                          for weights in zip(*all_client_weights)]
    return aggregated_weights


def get_size_in_mb(text):
    """
    Calculates the size of a string in megabytes (MB).

    Args:
        text: The string to calculate the size for.

    Returns:
        The size of the string in megabytes, rounded to two decimal places.
    """
    # Get the size of the string in bytes
    string_size_bytes = len(text.encode('utf-8'))

    # Convert bytes to megabytes and round to two decimal places
    size_in_mb = round(string_size_bytes / (1024 * 1024), 2)

    return size_in_mb


def federated_training():
    global logs
    if (len(clientQueue)!=0):
        client_id = clientQueue[0]
        with open('./global_update.pkl', 'rb') as file:
            loaded_data = pickle.load(file)
            url = 'http://host.docker.internal:9081/train'
            headers = {'Content-Type': ': application/json'}
            response = requests.post(url, json={'value':str(pickle.dumps(loaded_data),'latin1'),'data':{'epochs':3},'client_id':client_id}) 
            print(response)
            if response.status_code == 200:
                print("Request Sent to client "+client_id)
                logs.append("Request Sent to client"+client_id)
                del clientQueue[0]
            else:
                print("Error occurred while sending file to API. Status code:", response.status_code)
                return {'value':str(pickle.dumps(loaded_data),'latin1'),'data':{'epochs':3}}


# 3. Federated Learning Loop:
# def federated_training(global_model, participants):
#   global logs
#   global rounds_counter
  
#   print(f"-- Round {rounds_counter} --")
#   logs.append(f"-- Round {rounds_counter } --")
  
#   with open('./global_update.pkl', 'rb') as file:
#     loaded_data = pickle.load(file)
#     url = 'http://host.docker.internal:9081/train'
#     headers = {'Content-Type': ': application/json'}
#     response = requests.post(url, json={'value':str(pickle.dumps(loaded_data),'latin1'),'data':{'epochs':3}}) 
#     fileModel = open('sent.txt','w')
#     fileModel.write(str(pickle.dumps(loaded_data),'latin1'))
#     fileModel.close() 
#     print(response)
#     if response.status_code == 200:
#         print("File successfully sent to API.")
#         logs.append("File successfully sent to API.")
#     else:
#         print("Error occurred while sending file to API. Status code:", response.status_code)
#         return {'value':str(pickle.dumps(loaded_data),'latin1'),'data':{'epochs':3}}
  
#   return "All Training Done"

def getParticipants():
    url = 'http://host.docker.internal:9081/getParticipantList'
    headers = {'Content-Type': ': application/json'}
    response = requests.get(url)
    print(response)
    return response.json()

import logging
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logging.info("This is a log message from fl server")
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/")
@cross_origin()
def run():
    global clientsResponded
    global clientUpdateId
    global clientQueue
    global num_rounds
    global rounds_counter
    global logs
    global num_participants
    global global_model
    global_model = create_global_model()
    additional_info = {"learning_rate": 0.01, 'epochs':3}
    save_global_updates(global_model, additional_info)
    participants = list(getParticipants().values())
    clientQueue = participants
    num_participants = len(participants)
    print(f"-- Round {rounds_counter} --")
    logs.append(f"-- Round {rounds_counter } --")
    final_model = federated_training()
    return jsonify({"message": "OK"}), 200


@app.route("/get-logs")
@cross_origin()
def log():
    global logs
    data = {'value': '\n'.join(logs), 'code': 'SUCCESS'}
    return make_response(jsonify(data), 200)


@app.route("/response", methods=['POST'])
def resopnse():
    global clientsResponded
    global clientUpdateId
    global num_rounds
    global clientQueue
    global rounds_counter
    payload = request.get_json()
    print('sad', payload.keys())
    client_id = payload["client_id"]
    payload = json.loads(payload["completeData"])

    data = payload['data']
    string_data = payload['value']
    print(client_id,'responded')
    logs.append(f"{client_id} responded")
    
    clientsResponded.append(client_id)

    print('payload size', len(payload['value']))
    if payload['value'] == 'None':
      print(client_id,'rejected training')
      logs.append(f"{client_id} rejected training")
    
    else:
        clientUpdateId.append(client_id)
        with io.open(f"client_{client_id}_update.pkl", "wb") as file:
            # Write the string data as bytes to the file
            file.write(string_data.encode("latin1"))

    # Access the data part of the request
    # Example: {'key1': 'value1', 'key2': 'value2'}
    if len(clientQueue) == 0 and len(clientsResponded) == num_participants:
        client_update_files = [f"client_{cID}_update.pkl" for cID in clientUpdateId]
        print('aggregating')
        logs.append('Aggregating Weights')
        aggregated_weights = aggregate_client_updates(client_update_files)
        print('Aggregation Done!')
        logs.append('Aggregation Done!')
        #Round 2 code here
        if rounds_counter <= num_rounds:
            rounds_counter = rounds_counter + 1
            print(f"-- Round {rounds_counter} --")
            logs.append(f"-- Round {rounds_counter } --")
            clientsResponded = []
            clientUpdateId = []
            clientQueue = list(getParticipants().values())
            final_model = federated_training()
        else:
            clientsResponded = []
            clientUpdateId = []
            clientQueue = list(getParticipants().values())
            
    #sending for next client
    else:
      federated_training()

    return 'File and data received'+ '200'
   
if __name__ == "__main__":
    updated = []
    rejected = []
    logs = []
    num_rounds = 2
    rounds_counter = 1
    app.run(host='0.0.0.0', port=int("4500"), debug=True)
