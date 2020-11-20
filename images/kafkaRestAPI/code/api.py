from flask import Flask, request
import kafkaJobQueue
import os

kafkaUrl = os.environ['KAFKA_URL']

app = Flask(__name__)

kafkaTopicsCache = dict()

counter = 1

@app.route('/<topic_name>', methods=['POST']) 
def post_message(topic_name):
  global counter
  if not(topic_name in kafkaTopicsCache):
    kafkaTopicsCache[topic_name] = kafkaJobQueue.JobQueueProducer(kafkaUrl, topic_name, "KafkaRestAPI")
  
  producer = kafkaTopicsCache[topic_name]
  data_json = request.json
  producer.EnqueueSync(str(counter), data_json)
  print("sending #{0} to topic {1}".format(counter, topic_name))
  counter += 1
  return 'Posted', 201

if __name__ == "__main__":
  app.run(host= '0.0.0.0',debug=True)