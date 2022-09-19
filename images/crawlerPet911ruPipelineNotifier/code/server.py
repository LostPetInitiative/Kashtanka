from quart import Quart, request
import kafkajobs
from jsonschema import validate
from cardLoaders import pet911, kashtanka
import os

kafkaUrl = os.environ['KAFKA_URL']
outputQueueName = os.environ["OUTPUT_QUEUE"]
dbPAth = os.environ["DB_PATH"]

app = Quart(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*256 # 256Mb

counter = 1

# debugging card json preparation
# cardDir = os.path.join(dbPAth,"rl538010")
# cardJson = pet911.GetPetCard(cardDir)
# print("card loaded")
# print(cardJson)


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
        if cardJson is None:
            print(f"Cand read the card from: {cardDir}")
            continue
        validate(instance=cardJson, schema=kashtanka.schema)
        print("sending #{0}\t({1})".format(counter, cardId))
        producer.Enqueue(str(counter), cardJson)
        print("sent #{0}\t({1})".format(counter, cardId))
        counter += 1

    
    return 'Posted', 201

if __name__ == "__main__":
  app.run(host= '0.0.0.0',port=5001,debug=True)