from quart import Quart, request
import threading
import kafkajobs
import os

kafkaUrl = os.environ['KAFKA_URL']

app = Quart(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*256 # 256Mb

kafkaTopicsCache = dict()

counter = 1

lock = threading.Lock()

@app.route('/<topic_name>', methods=['POST']) 
async def post_message(topic_name):
  try:
    print(f"Processing post request to {topic_name}")
    global counter
    with lock:
      if not(topic_name in kafkaTopicsCache):
        kafkaTopicsCache[topic_name] = kafkajobs.jobqueue.JobQueueProducer(kafkaUrl, topic_name, "KafkaRestAPI")
        print(f"Created producer for topic {topic_name}")
    
    producer = kafkaTopicsCache[topic_name]    
    data_json = await request.get_json()    
    print("sending #{0} to topic {1}".format(counter, topic_name))
    with lock:
      producer.Enqueue(str(counter), data_json)
    print("sent #{0} to topic {1}".format(counter, topic_name))
    
    counter += 1
    return 'Posted', 201
  except Exception as ex1:
    print(f"Exception: {ex1}. Replying 500")
    return f'Error - {ex1}',500

if __name__ == "__main__":
  app.run(host= '0.0.0.0',debug=True)