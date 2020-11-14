import kafkaJobQueue
import npSerialization

import copy

import shutil
import os
import base64
import asyncio
import datetime
import requests
import json

kafkaUrl = os.environ['KAFKA_URL']
inputQueueName = os.environ['INPUT_QUEUE']
cardStorageRestApiURL = os.environ['CARD_STORAGE_REST_API_URL']

appName = "processedCardsPersister"

worker = kafkaJobQueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=inputQueueName, appName=appName)

async def work():
    print("Service started. Pooling for a job")
    while True:        
        job = worker.GetNextJob(5000)
        #print("Got job {0}".format(job))
        uid = job["UID"]
        print("{0}: Starting to process the job".format(uid))
        
        splitted = uid.split("_")
        namespace = splitted[0]
        local_id = splitted[1]

        # deep coping
        cardJson = copy.deepcopy(job)
        # then clearing not needed fields
        cardJson.pop('UID', None)
        cardJson.pop('images', None)
        cardJson.pop('annotatedImages', None)
        cardJson.pop('detectedPetImages', None)
        cardJson.pop('detectedPetScores', None)
        cardJson.pop('detectedPetRotations', None)
        # then setting additional fields
        cardJson["PetType"] = job["pet"]
        cardJson["CardCreationTime"] = datetime.datetime.utcnow().isoformat()[0:-7]
        cardJson["ProvenanceURL"] = 'https://pet911.ru/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80/%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%B0/%D0%BA%D0%BE%D1%88%D0%BA%D0%B0/{0}'.format(local_id)

        
        cardURL = "{0}/PetCards/{1}/{2}/".format(cardStorageRestApiURL,namespace,local_id)
        print("{0}: Putting a card to {1}".format(uid, cardURL))
        response = requests.put(cardURL, json = cardJson)
        print("{0}: Got card put status code {1}".format(uid,response.status_code))
        if response.status_code != 200:
                print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
        imageIdx = 0
        print("{0}: {1} photos to put".format(uid,len(job['annotatedImages'])))
        for annotatedImage in job['annotatedImages']:
            photoJson = {
                "AnnotatedImage": annotatedImage["data"],
                "AnnotatedImageType": "jpg", # our services always produce jpg
                "ExtractedImage": job['detectedPetImages'][imageIdx]["data"],
                "DetectionConfidence": float(job['detectedPetScores'][imageIdx]),
                "DetectionRotation": job['detectedPetRotations'][imageIdx]
            }
            #print(json.dumps(photoJson))
            imageURL = "{0}/PetPhotos/{1}/{2}/{3}".format(cardStorageRestApiURL, namespace, local_id, imageIdx+1)
            print("{0}: Putting a photo {1} to {2}".format(uid, imageIdx+1, imageURL))
            response = requests.put(imageURL, json = photoJson)
            print("{0}: Got image put status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
            
            imageIdx+=1

        feature_vectors = list()
        for key in job:
            if key.endswith("_features"):
                features = npSerialization.Base64strToNpArray(job[key]).tolist()
                featuresIdent = key[0: -len("_features")]
                print("{0}: Extracted features {1}. Feature vector of {2} elements".format(uid, featuresIdent, len(features)))
                feature_vectors.append((featuresIdent, features))
        print("{0}: {1} feature vectors to put".format(uid, len(feature_vectors)))
        for (ident,vector) in feature_vectors:
            featureURL = "{0}/PetCards/{1}/{2}/features/{3}".format(cardStorageRestApiURL, namespace, local_id, ident)
            featuresJson = {"features": vector}
            print("{0}: Putting features {1} to {2}".format(uid, ident, featureURL))
            response = requests.put(featureURL, json = featuresJson)
            print("{0}: Got features put status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
            
        print("{0}: Job is done. Committing".format(uid))
        worker.Commit()
        print("{0}: Commited".format(uid))
        

asyncio.run(work(),debug=False)