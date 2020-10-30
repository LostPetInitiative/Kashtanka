FROM ubuntu

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y python3.8 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY code /app
COPY requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

ENV KAFKA_URL=kafka-cluster.kashtanka:9092
ENV INPUT_QUEUE=CrawledPetCards
ENV OUTPUT_QUEUE=DistinctPhotosPetCards

CMD python3.8 petPhotoDuplicateRemovalService.py
