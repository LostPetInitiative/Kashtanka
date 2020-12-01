FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.kashtanka:9092
ENV OUTPUT_QUEUE=kashtanka_crawled_pet_cards
ENV DB_PATH=/db

EXPOSE 5001

CMD python3 -u server.py