import asyncio
import sys
import pet911
import requests
#import kafkaJobQueue

kafkaRestAddr = sys.argv[1]
targetDir = sys.argv[2]

async def work():
    #queue = kafkaJobQueue.JobQueueProducer(kafkaAddr, "kashtanka_crawled_pet_cards", "postPet911Once.py")

    card = pet911.GetPetCard(targetDir)
    uid = card['uid']

    response = requests.post(kafkaRestAddr, json = card)
    print("Got card posr status code {0}".format(response.status_code))
    if response.status_code != 201:
        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))

    #await queue.Enqueue(jobName, card)
    print("Posted {0}".format(uid))

asyncio.run(work(),debug=False)




