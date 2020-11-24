from quart import Quart, request
import kafkaJobQueue
import os

kafkaUrl = os.environ['KAFKA_URL']

app = Quart(__name__)

kafkaTopicsCache = dict()

counter = 1

@app.route('/<topic_name>', methods=['POST']) 
async def post_message(topic_name):
  print(f"Processing post request to {topic_name}")
  global counter
  if not(topic_name in kafkaTopicsCache):
    kafkaTopicsCache[topic_name] = kafkaJobQueue.JobQueueProducer(kafkaUrl, topic_name, "KafkaRestAPI")
    print(f"Created producer for topic {topic_name}")
  
  producer = kafkaTopicsCache[topic_name]
  data_json = await request.get_json()
  print("sending #{0} to topic {1}".format(counter, topic_name))
  await producer.Enqueue(str(counter), data_json)
  print("sent #{0} to topic {1}".format(counter, topic_name))
  
  counter += 1
  return 'Posted', 201

if __name__ == "__main__":
  app.run(host= '0.0.0.0',debug=True)