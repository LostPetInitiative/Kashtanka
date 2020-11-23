FROM ubuntu

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y python3.8 python3-pip && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.kashtanka:9092
ENV INPUT_QUEUE=kashtanka_cards_with_features
ENV CARD_STORAGE_REST_API_URL=http://storage-api
ENV CARD_INDEX_REST_API_URL=http://solr/solr/kashtankacards/update/json/docs

CMD python3.8 -u persisterService.py