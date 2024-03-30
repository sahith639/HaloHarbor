# Base image
FROM python

# Set the working directory
WORKDIR /app

COPY requirements.txt .

RUN pip install requests
RUN pip install -r requirements.txt

COPY . .

# Start the application
CMD ["python", "-u","app.py"]

