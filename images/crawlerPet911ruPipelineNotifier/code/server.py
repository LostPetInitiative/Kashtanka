from quart import Quart, request
import kafkajobs
import pet911
import os

kafkaUrl = os.environ['KAFKA_URL']
outputQueueName = os.environ["OUTPUT_QUEUE"]
dbPAth = os.environ["DB_PATH"]

app = Quart(__name__)

counter = 1

producer = kafkajobs.jobqueue.JobQueueProducer(kafkaUrl, outputQueueName, "Crawler-pet911ru-pipeline-submitter")

@app.route('/', methods=['POST']) 
async def post_message():
    print("Processing post request")
    global counter
    data_json = await request.get_json()
    print(f"Successfully parsed json. {len(data_json['cardIds'])} cards to post")

    for cardId in data_json['cardIds']:
        cardDir = os.path.join(dbPAth,cardId)
        cardJson = pet911.GetPetCard(cardDir)
        print("sending #{0}\t({1})".format(counter, cardId))
        producer.Enqueue(str(counter), cardJson)
        print("sent #{0}\t({1})".format(counter, cardId))
        counter += 1

    
    return 'Posted', 201

if __name__ == "__main__":
  app.run(host= '0.0.0.0',port=5001,debug=True)