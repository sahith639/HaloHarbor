# Base image
FROM python

# Set the working directory
WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install scipy
RUN pip install keras-layer-normalization

COPY . .

# Start the application
CMD ["python", "-u","app.py"]

