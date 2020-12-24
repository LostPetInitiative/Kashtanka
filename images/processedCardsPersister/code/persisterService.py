import copy

import shutil
import os
import base64
import asyncio
import datetime
import requests
import json

import kafkajobs

kafkaUrl = os.environ['KAFKA_URL']
inputQueueName = os.environ['INPUT_QUEUE']
if 'CARD_STORAGE_REST_API_URL' in os.environ:
    cardStorageRestApiURL = os.environ['CARD_STORAGE_REST_API_URL']
    print("CARD_STORAGE_REST_API_URL defined : Enabling card storage into {0}".format(cardStorageRestApiURL))
else:
    cardStorageRestApiURL = None
    print("CARD_STORAGE_REST_API_URL is not defined. Will not persist cards into a storage")
if 'CARD_INDEX_REST_API_URL' in os.environ:
    cardIndexRestApiURL = os.environ['CARD_INDEX_REST_API_URL']
    print("CARD_INDEX_REST_API_URL defined : Enabling card indexing into {0}".format(cardIndexRestApiURL))
else:
    cardIndexRestApiURL = None
    print("CARD_INDEX_REST_API_URL is not defined. Will not persist cards into a storage")



appName = "processedCardsPersister"

worker = kafkajobs.jobqueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=inputQueueName, appName=appName)

async def work():
    print("Service started. Pooling for a job")
    while True:        
        job = worker.GetNextJob(5000)
        #print("Got job {0}".format(job))
        uid = job["uid"]
        print("{0}: Starting to process the job".format(uid))
        
        splitted = uid.split("_")
        namespace = splitted[0]
        local_id = splitted[1]

        feature_vectors = list()
        for key in job:
            if key.endswith("_features"):
                features = kafkajobs.serialization.base64strToNpArray(job[key]).tolist()
                featuresIdent = key[0: -len("_features")]
                print("{0}: Extracted features {1}. Feature vector of {2} elements".format(uid, featuresIdent, len(features)))
                feature_vectors.append((featuresIdent, features))
        print("{0}: {1} feature vectors detected".format(uid, len(feature_vectors)))

        def copyIfSet(srcDict,destDict, key, newKey = None):
            if (key in srcDict) and (not(srcDict[key] is None)):
                if newKey is None:
                    destDict[key] = srcDict[key]
                else:
                    destDict[newKey] = srcDict[key]

        cardCreationTimeStr = datetime.datetime.utcnow().isoformat()[0:-7]+"Z"

        # snake_case to PascalCase
        cassasndaCardJson = { 'CardCreationTime' : cardCreationTimeStr }
        copyIfSet(job, cassasndaCardJson, 'card_type', 'CardType')
        copyIfSet(job, cassasndaCardJson, 'contact_info', 'ContactInfo')
        copyIfSet(job, cassasndaCardJson, 'event_time', 'EventTime')
        copyIfSet(job, cassasndaCardJson, 'event_time_provenance', 'EventTimeProvenance')
        copyIfSet(job, cassasndaCardJson, 'location', 'Location')
        copyIfSet(job, cassasndaCardJson, "animal", 'Animal')
        copyIfSet(job, cassasndaCardJson, "animal_sex", 'AnimalSex')
        copyIfSet(job, cassasndaCardJson, "provenance_url", 'ProvenanceURL')
        
        # solr card schema transforming
        solrCardJson = {
            "id":  "{0}/{1}".format(namespace,local_id)
        }
        if "location" in job:
            location = job["location"]
            if "Address" in location:
                solrCardJson["address"] = location["Address"]
            if "Lat" in location and "Lon" in location:
                solrCardJson["location"] = "{0}, {1}".format(location["Lat"],location["Lon"])
            if "CoordsProvenance" in location:
                solrCardJson["location_provenance"] = location["CoordsProvenance"]
        if "animal" in job:
            solrCardJson["animal"] = job["animal"].capitalize()
        if "animal_sex" in job:
            solrCardJson["sex"] = job["animal_sex"].capitalize()
        if "card_type" in job:
            solrCardJson["card_type"] = job["card_type"].capitalize()
        if "contact_info" in job:
            contactInfo = job["contact_info"]
            if "Comment" in contactInfo:
                solrCardJson["contact_info_comment"] = contactInfo["Comment"]
            if "Tel" in contactInfo:
                solrCardJson["contact_info_tel"] = contactInfo["Tel"]
            if "Email" in contactInfo:
                solrCardJson["contact_info_email"] = contactInfo["Email"]
            if "Name" in contactInfo:
                solrCardJson["contact_info_name"] = contactInfo["Name"]
        if "event_time" in job:
            solrCardJson["event_time"] = job["event_time"],
        if "event_time_provenance" in job:
            solrCardJson["event_time_provenance"] = job["event_time_provenance"]
        if "CardCreationTime" in cassasndaCardJson:
            solrCardJson["card_creation_time"] = cassasndaCardJson["CardCreationTime"]
        for (featuresIdent,vector) in feature_vectors:
            solrCardJson["features_{0}".format(featuresIdent)] = ", ".join(["{0}".format(x) for x in vector])

        if not(cardStorageRestApiURL is None):
            cardURL = "{0}/PetCards/{1}/{2}/".format(cardStorageRestApiURL,namespace,local_id)
            print("{0}: Putting a card to {1}".format(uid, cardURL))
            response = requests.put(cardURL, json = cassasndaCardJson)
            print("{0}: Got card put status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                    print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                    exit(1)
        if not(cardIndexRestApiURL is None):
            cardIndexURL = "{0}".format(cardIndexRestApiURL)
            print("{0}: Sending a card to {1} for indexing".format(uid, cardIndexURL))
            response = requests.post(cardIndexURL, json = solrCardJson)
            print("{0}: Got card indexing status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                    print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                    exit(2)
        imageIdx = 0
        print("{0}: {1} photos to put".format(uid,len(job['annotated_images'])))
        for annotatedImage in job['annotated_images']:
            photoJson = {
                "AnnotatedImage": annotatedImage["data"],
                "AnnotatedImageType": "jpg", # our services always produce jpg
                "ExtractedImage": job['detected_pet_images'][imageIdx]["data"],
                "DetectionConfidence": float(job['detected_pet_scores'][imageIdx]),
                "DetectionRotation": job['detected_pet_rotations'][imageIdx]
            }
            #print(json.dumps(photoJson))
            imageURL = "{0}/PetPhotos/{1}/{2}/{3}".format(cardStorageRestApiURL, namespace, local_id, imageIdx+1)
            print("{0}: Putting a photo {1} to {2}".format(uid, imageIdx+1, imageURL))
            response = requests.put(imageURL, json = photoJson)
            print("{0}: Got image put status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                exit(3)
            
            imageIdx+=1

        for (ident,vector) in feature_vectors:
            featureURL = "{0}/PetCards/{1}/{2}/features/{3}".format(cardStorageRestApiURL, namespace, local_id, ident)
            featuresJson = {"features": vector}
            print("{0}: Putting features {1} to {2}".format(uid, ident, featureURL))
            response = requests.put(featureURL, json = featuresJson)
            print("{0}: Got features put status code {1}".format(uid,response.status_code))
            if response.status_code != 200:
                print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                exit(4)
            
        print("{0}: Job is done. Committing".format(uid))
        worker.Commit()
        print("{0}: Commited".format(uid))
        

asyncio.run(work(),debug=False)