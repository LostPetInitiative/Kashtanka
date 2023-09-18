import os
import asyncio
import datetime
import requests
import numpy as np
import json
from PIL import Image

import kafkajobs

kafkaUrl = os.environ['KAFKA_URL']
inputQueueName = os.environ['INPUT_QUEUE']

if 'CARD_STORAGE_REST_API_URL' in os.environ:
    cardStorageRestApiURL = os.environ['CARD_STORAGE_REST_API_URL']
    print("CARD_STORAGE_REST_API_URL is defined : Enabling card storage into {0}".format(cardStorageRestApiURL))
else:
    cardStorageRestApiURL = None
    print("CARD_STORAGE_REST_API_URL is not defined. Will not persist cards into a storage")

if 'CARD_INDEX_REST_API_URL' in os.environ:
    cardIndexRestApiURL = os.environ['CARD_INDEX_REST_API_URL']
    print("CARD_INDEX_REST_API_URL is defined : Enabling card indexing into {0}".format(cardIndexRestApiURL))
else:
    cardIndexRestApiURL = None
    print("CARD_INDEX_REST_API_URL is not defined. Will not persist cards into index")

if 'CALVIN_ZHIRUI_IMAGE_INDEX_REST_API_URL' in os.environ:
    calZhiruiIndexRestApiURL = os.environ['CALVIN_ZHIRUI_IMAGE_INDEX_REST_API_URL']
    print("CALVIN_ZHIRUI_IMAGE_INDEX_REST_API_URL is defined : Enabling photo indexing into {0}".format(calZhiruiIndexRestApiURL))
else:
    calZhiruiIndexRestApiURL = None
    print("CALVIN_ZHIRUI_IMAGE_INDEX_REST_API_URL is not defined. Will not persist cards into index")


if 'PERSIST_CARD_WITH_ORIG_IMAGES' in os.environ:
    persistCardWithOrigImages = os.environ['PERSIST_CARD_WITH_ORIG_IMAGES']
    print("PERSIST_CARD_WITH_ORIG_IMAGES is defined.")
else:
    persistCardWithOrigImages = None
    print("PERSIST_CARD_WITH_ORIG_IMAGES is not defined. Will not persist cards into a storage")

if 'PERSIST_CALVIN_ZHIRUI_YOLO5_IMAGES' in os.environ:
    persistCalvinZhiruiYolo5Images = os.environ['PERSIST_CALVIN_ZHIRUI_YOLO5_IMAGES']
    print("PERSIST_CALVIN_ZHIRUI_YOLO5_IMAGES is defined.")
else:
    persistCalvinZhiruiYolo5Images = None
    print("PERSIST_CALVIN_ZHIRUI_YOLO5_IMAGES is not defined.")

if 'PERSIST_PHOTO_FEATURES' in os.environ:
    persistPhotoFeatures = os.environ['PERSIST_PHOTO_FEATURES']
    print(f"PERSIST_PHOTO_FEATURES is defined: {persistPhotoFeatures}")
else:
    persistPhotoFeatures = None
    print("PERSIST_PHOTO_FEATURES is not defined.")



appName = f"dataPersister_{inputQueueName}"

worker = kafkajobs.jobqueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=inputQueueName, appName=appName)

def ReduceImageSize(serializedImage,targetWidth=400):
    decodedNp = kafkajobs.serialization.imageB64SerializedStructToNp(serializedImage)
    decodedPilImg = Image.fromarray(decodedNp.astype('uint8'), 'RGB')
    shape = decodedNp.shape
    ratio = shape[0]/targetWidth
    if ratio <= 1.0:
        # we do not need to reduce size as the size is already smaller
        return serializedImage
    resizedPilImg = decodedPilImg.resize((int(shape[1] / ratio), targetWidth))
    resizedNp = np.array(resizedPilImg)
    
    encoded = kafkajobs.serialization.imageNpToB64SerializedStruct(resizedNp)
    return encoded

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

        
        cassasndaCardJson = None
        if not(cardStorageRestApiURL is None):
            if not(persistCardWithOrigImages is None):
                cassasndaCardJson = { 'CardCreationTime' : cardCreationTimeStr , 'Features': dict() }
                # snake_case to PascalCase
                copyIfSet(job, cassasndaCardJson, 'card_type', 'CardType')
                copyIfSet(job, cassasndaCardJson, 'contact_info', 'ContactInfo')
                copyIfSet(job, cassasndaCardJson, 'event_time', 'EventTime')
                copyIfSet(job, cassasndaCardJson, 'event_time_provenance', 'EventTimeProvenance')
                copyIfSet(job, cassasndaCardJson, 'location', 'Location')
                copyIfSet(job, cassasndaCardJson, "animal", 'Animal')
                copyIfSet(job, cassasndaCardJson, "animal_sex", 'AnimalSex')
                copyIfSet(job, cassasndaCardJson, "provenance_url", 'ProvenanceURL')

                cardURL = "{0}/PetCards/{1}/{2}/".format(cardStorageRestApiURL,namespace,local_id)
                print("{0}: Putting a card to {1}".format(uid, cardURL))
                response = requests.put(cardURL, json = cassasndaCardJson)
                print("{0}: Got card put status code {1}".format(uid,response.status_code))
                if (response.status_code // 100 != 2) and response.status_code != 409:
                        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                        exit(1)
                if(response.status_code == 409):
                    print("{0}: Card already exists.".format(uid))

                imageIdx = 0
                print("{0}: {1} orig photos to put".format(uid,len(job['images'])))
                
                for image in job['images']:

                    # reducing image size to save cassandra disk space
                    image = ReduceImageSize(image)

                    photoJson = {
                        "imageB64": image["data"],
                        "imageMimeType": "image/jpeg"                    
                    }
                    #print(json.dumps(photoJson))
                    imageURL = "{0}/PetPhotos/{1}/{2}/{3}".format(cardStorageRestApiURL, namespace, local_id, imageIdx+1)
                    print("{0}: Putting a photo {1} to {2}".format(uid, imageIdx+1, imageURL))
                    response = requests.put(imageURL, json = photoJson)
                    print("{0}: Got image put status code {1}".format(uid,response.status_code))
                    if (response.status_code // 100 != 2) and response.status_code != 409:
                        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                        exit(3)
                    if(response.status_code == 409):
                        print("{0}: Photo {1} already exists.".format(uid, imageIdx+1))
                    
                    imageIdx+=1

            if not(persistPhotoFeatures is None):
                imageIdx = 0
                print(f"{uid}: {len(job['image_embeddings'])} image embeddings to persist as {persistPhotoFeatures}")
                for toPut in job['image_embeddings']:
                    featuresURL = f"{cardStorageRestApiURL}/PetPhotos/{namespace}/{local_id}/{imageIdx+1}/features/{persistPhotoFeatures}"
                    vector = kafkajobs.serialization.base64strToNpArray(toPut['embedding']).tolist()
                    featuresJson = {"features": vector}
                    print("{0}: Putting features {1} to {2}".format(uid, persistPhotoFeatures, featuresURL))
                    response = requests.put(featuresURL, json = featuresJson)
                    print("{0}: Got features put status code {1}".format(uid,response.status_code))
                    if response.status_code // 100 != 2:
                        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                        exit(4)
                    imageIdx+=1

            if not(persistCalvinZhiruiYolo5Images is None):
                imageIdx = 0
                print("{0}: {1} Cal/Zhirui annotated images to put".format(uid,len(job['yolo5_output'])))

                for toPut in job['yolo5_output']:
                    image = ReduceImageSize(toPut['annotated'])
                    photoJson = {
                        "imageB64": image["data"],
                        "imageMimeType": "image/jpeg"                    
                    }
                    imageURL = "{0}/PetPhotos/{1}/{2}/{3}/processed/CalZhiruiAnnotatedHead".format(cardStorageRestApiURL, namespace, local_id, imageIdx+1)
                    print("{0}: Putting a photo {1} to {2}".format(uid, imageIdx+1, imageURL))
                    response = requests.put(imageURL, json = photoJson)
                    print("{0}: Got image put status code {1}".format(uid,response.status_code))
                    if (response.status_code // 100 != 2) and response.status_code != 409:
                        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                        exit(3)
                    if(response.status_code == 409):
                        print("{0}: Photo {1} already exists.".format(uid, imageIdx+1))
                    
                    imageIdx+=1
        
        if not(cardIndexRestApiURL is None):
             # solr card schema transforming
            solrCardJson = {
                "id":  "{0}/{1}".format(namespace,local_id)
            }
            if "location" in job:
                location = job["location"]
                if "Address" in location:
                    solrCardJson["address"] = location["Address"]
                if "Lat" in location and "Lon" in location:
                    # it seems that Solr does not accept longatude > 180. thus converting range [0,360) -> [-180,180)
                    # see https://github.com/LostPetInitiative/Kashtanka/issues/28
                    while location["Lon"] > 180.0:
                        location["Lon"] -= 360.0
                    while location["Lon"] < -180.0:
                        location["Lon"] += 360.0
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
            
            solrCardJson["card_creation_time"] = cardCreationTimeStr
            # for (featuresIdent,vector) in feature_vectors:
            #     solrCardJson["features_{0}".format(featuresIdent)] = ", ".join(["{0}".format(x) for x in vector])
        
            cardIndexURL = "{0}".format(cardIndexRestApiURL)
            print("{0}: Sending a card to {1} for indexing".format(uid, cardIndexURL))
            response = requests.post(cardIndexURL, json = solrCardJson)
            print("{0}: Got card indexing status code {1}".format(uid,response.status_code))
            if response.status_code // 100 != 2:
                    print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
                    exit(2)    

        if not(calZhiruiIndexRestApiURL is None):
            imageIdx = 0
            print("{0}: {1} Cal/Zhirui image embeddings to index".format(uid,len(job['image_embeddings'])))

            for toPut in job['image_embeddings']:     
                # solr card schema transforming
                imId = f"{namespace}/{local_id}/{imageIdx+1}"
                solrCardJson = {
                    "id":  imId,
                    "num": imageIdx+1
                }
                if "location" in job:
                    location = job["location"]
                    if "Lat" in location and "Lon" in location:
                        # it seems that Solr does not accept longatude > 180. thus converting range [0,360) -> [-180,180)
                        # see https://github.com/LostPetInitiative/Kashtanka/issues/28
                        while location["Lon"] > 180.0:
                            location["Lon"] -= 360.0
                        while location["Lon"] < -180.0:
                            location["Lon"] += 360.0
                        solrCardJson["location"] = "{0}, {1}".format(location["Lat"],location["Lon"])                    
                if "animal" in job:
                    solrCardJson["animal"] = job["animal"].capitalize()
                if "animal_sex" in job:
                    solrCardJson["sex"] = job["animal_sex"].capitalize()
                if "card_type" in job:
                    solrCardJson["card_type"] = job["card_type"].capitalize()
                if "event_time" in job:
                    solrCardJson["event_time"] = job["event_time"],
                
                solrCardJson["card_creation_time"] = cardCreationTimeStr
                
                # Calvin-Zhiurui embedding
                vector = kafkajobs.serialization.base64strToNpArray(toPut['embedding'])
                vector_norm = np.linalg.norm(vector)
                vector_normalized = vector / vector_norm
                solrCardJson["calvin_zhirui_embedding"] = vector_normalized.tolist()  #", ".join(["{0}".format(x) for x in vector])
                solrCardJson["calvin_zhirui_detected_heads"] = toPut['head_count']
            
                indexURL = "{0}".format(calZhiruiIndexRestApiURL)
                print("{0}: Sending a image to {1} for indexing".format(imId, indexURL))
                response = requests.post(indexURL, json = solrCardJson)
                #print(json.dumps(solrCardJson))
                print("{0}: Got card indexing status code {1}".format(imId,response.status_code))
                if response.status_code // 100 != 2:
                    print("{0}: Unsuccessful status code! Error {1}".format(imId,response.text))
                    exit(2)
                imageIdx+=1
        
        # for (ident,vector) in feature_vectors:
        #     featureURL = "{0}/PetCards/{1}/{2}/features/{3}".format(cardStorageRestApiURL, namespace, local_id, ident)
        #     featuresJson = {"features": vector}
        #     print("{0}: Putting features {1} to {2}".format(uid, ident, featureURL))
        #     response = requests.put(featureURL, json = featuresJson)
        #     print("{0}: Got features put status code {1}".format(uid,response.status_code))
        #     if response.status_code != 200:
        #         print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
        #         exit(4)
            
        print("{0}: Job is done. Committing".format(uid))
        worker.Commit()
        print("{0}: Commited".format(uid))
        

asyncio.run(work(),debug=False)
