FROM python:3.8-slim

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y wget && \
    rm -rf /var/lib/apt/lists/*

RUN wget -v https://grechka.family/dmitry/sandbox/dist/kafka_job_scheduler-0.1.1-py3-none-any.whl && \
    pip3 install kafka_job_scheduler-0.1.1-py3-none-any.whl && \
    rm kafka_job_scheduler-0.1.1-py3-none-any.whl

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY code /app

ENV KAFKA_URL=kafka-cluster.default:9092
ENV TOPIC_NAME=undefined
ENV TRELLO_KEY=undefined
ENV TRELLO_TOKEN=undefined
ENV TRELLO_LIST=undefined
ENV TRELLO_APP_MEMBER_ID=undefined

CMD python3 -u service.py