import json
import asyncio
import sys
import pet911
import kafkaJobQueue


kafkaAddr = sys.argv[1]
targetDir = sys.argv[2]

async def work():
    queue = kafkaJobQueue.JobQueueProducer(kafkaAddr, "detectPetJobs", "postPet911Once.py")

    card = pet911.GetPetCard(targetDir)

    jobName = card['UID']
    await queue.Enqueue(jobName, card)
    print("Posted {0}".format(jobName))

asyncio.run(work(),debug=False)




