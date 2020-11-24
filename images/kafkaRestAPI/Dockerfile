FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.kashtanka:9092

EXPOSE 5000

CMD python3 -u api.py