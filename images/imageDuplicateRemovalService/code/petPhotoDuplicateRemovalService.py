import kafkaJobQueue

import shutil
import os
import base64
import asyncio
import imagehash
from skimage import io
from PIL import Image

kafkaUrl = os.environ['KAFKA_URL']
inputQueueName = os.environ['INPUT_QUEUE']
outputQueueName = os.environ['OUTPUT_QUEUE']

appName = "PetImageDuplicateRemover"

worker = kafkaJobQueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=inputQueueName, appName=appName)
resultQueue = kafkaJobQueue.JobQueueProducer(kafkaUrl, outputQueueName, appName)

workdir = '/tmp'
hashSize = 8
hashSimilarityThreshold = 4

async def work():
    print("Service started. Pooling for a job")
    while True:        
        job = worker.GetNextJob(5000)
        #print("Got job {0}".format(job))
        uid = job["UID"]
        print("{0}: Starting to process the job".format(uid))
        images = job['images']
        print("{0}: Extracting {1} images".format(uid, len(images)))
        jobPath = os.path.join(workdir,uid)
        os.mkdir(jobPath)
        hashes = []
        hashImageIdx = []
        distinctImages = []
        try:
            imgIdx = 0
            # decoding images and calculting their hashes
            for image in images:
                imgType = image['type']
                image_b64 : str = image['data']
                imageData = base64.decodebytes(image_b64.encode("utf-8"))
                imageFilePath = os.path.join(jobPath,"{0}.{1}".format(imgIdx,imgType))
                with open(imageFilePath, "wb") as file1:             
                    file1.write(imageData)
                try:
                    if imageFilePath.endswith(".png"):
                        imNumpy = io.imread(imageFilePath,plugin='imread')
                    else:
                        imNumpy = io.imread(imageFilePath)
                
                    im = Image.fromarray(imNumpy)
                    a_hash = imagehash.average_hash(im, hash_size=hashSize)
                    p_hash = imagehash.phash(im, hash_size=hashSize)
                    d_hash = imagehash.dhash(im, hash_size=hashSize)
                    w_hash = imagehash.whash(im, hash_size=hashSize)

                    hashes.append((a_hash,p_hash,d_hash,w_hash))
                    hashImageIdx.append(imgIdx)
                except Exception as exc1:
                    print("{0}: Error calulating hash for one of the images ({1})".format(uid, exc1))        
                imgIdx += 1

            hashesCount = len(hashes)
            print("{0}: Calculated hashes for {1} images".format(uid, hashesCount))

            # checking for similarity
            for idx1 in range(hashesCount-1):
                duplicateFound = False
                for idx2 in range(idx1+1,hashesCount):
                    (a_hash_1, p_hash_1, d_hash_1, w_hash_1) = hashes[idx1]
                    (a_hash_2, p_hash_2, d_hash_2, w_hash_2) = hashes[idx2]
                    hashDiff = \
                        (a_hash_1 - a_hash_2) + \
                        (p_hash_1 - p_hash_2) + \
                        (d_hash_1 - d_hash_2) + \
                        (w_hash_1 - w_hash_2)
                    if hashDiff <= hashSimilarityThreshold:
                        print("{0}: image {1} and {2} are similar. Skipping former one".format(uid, hashImageIdx[idx1], hashImageIdx[idx2]))
                        duplicateFound = True
                        break
                if not duplicateFound:
                    distinctImages.append(images[hashImageIdx[idx1]])

            
            if hashesCount>0:
                # last one is always added (as we may skip only preceeding duplicates)
                distinctImages.append(images[hashImageIdx[hashesCount-1]])
            print("{0}: Found {1} distinct images".format(uid, hashesCount))

            job['images'] = distinctImages
            await resultQueue.Enqueue(uid, job)
            print("{0}: Posted result in output queue".format(uid))
            worker.Commit()
            print("{0}: Commited".format(uid))
        finally:
            shutil.rmtree(jobPath)

asyncio.run(work(),debug=False)