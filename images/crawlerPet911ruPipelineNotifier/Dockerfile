FROM python:3.8-slim

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y wget && \
    rm -rf /var/lib/apt/lists/*

RUN wget -v https://grechka.family/dmitry/sandbox/dist/kafka_job_scheduler-0.1.1-py3-none-any.whl && \
    pip install kafka_job_scheduler-0.1.1-py3-none-any.whl && \
    rm kafka_job_scheduler-0.1.1-py3-none-any.whl

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.kashtanka:9092
ENV OUTPUT_QUEUE=kashtanka_crawled_pet_cards
ENV DB_PATH=/db

EXPOSE 5001

CMD python3 -u server.py