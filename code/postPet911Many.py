import asyncio
import sys
import os
import pet911
import kafkaJobQueue


kafkaAddr = sys.argv[1]
targetDir = sys.argv[2]
limitCount = 10000000
if len(sys.argv) >= 4:
    limitCount = int(sys.argv[3])

async def work():
    print("Pushing cards from {0} to {1}, no more than {2}".format(targetDir,kafkaAddr, limitCount))
    dirsToPost = sorted(x for x in os.listdir(targetDir) if x.startswith("rl") or x.startswith("rf"))
    dirsToPost = dirsToPost[0:min(limitCount, len(dirsToPost))]
    print("Found {0} cards to push".format(len(dirsToPost)))
    queue = kafkaJobQueue.JobQueueProducer(kafkaAddr, "CrawledPetCards", "postPet911Once.py")
    for dirToPost in dirsToPost:
        fullDirToPost = os.path.join(targetDir,dirToPost)
        print("Posting {0}".format(fullDirToPost))
        card = pet911.GetPetCard(fullDirToPost)
        jobName = card['UID']
        await queue.Enqueue(jobName, card)
        print("Posted {0}".format(jobName))
    print("Done")

asyncio.run(work(),debug=False)




