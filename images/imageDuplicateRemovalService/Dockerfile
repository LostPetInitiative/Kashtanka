FROM python:3.6-slim

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y libpng-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.kashtanka:9092
ENV INPUT_QUEUE=kashtanka_crawled_pet_cards
ENV OUTPUT_QUEUE=kashtanka_distinct_photos_pet_cards

CMD python3.6 -u petPhotoDuplicateRemovalService.py
