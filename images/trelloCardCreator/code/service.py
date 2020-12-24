import copy

import shutil
import os
import base64
import asyncio
import datetime
import base64
import requests
import json

import kafkajobs

kafkaUrl = os.environ['KAFKA_URL']
inputQueueName = os.environ['INPUT_QUEUE']
trelloKey = os.environ['TRELLO_KEY']
trelloToken = os.environ['TRELLO_TOKEN']
trelloIdList = os.environ['TRELLO_LIST']
trelloAppMemberId = os.environ['TRELLO_APP_MEMBER_ID']

appName = "processedCardsTrelloCardsCreator"

worker = kafkajobs.jobqueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=inputQueueName, appName=appName)

maxCardCreationRetryCount = 10

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

        if (job['card_type'] == "found") and (len(job['annotated_images']) > 0):

            # creating a trello card
            url = "https://api.trello.com/1/cards"

            query = {
                'key': trelloKey,
                'token': trelloToken,
                'idList': trelloIdList,
                'pos': "bottom",
                'name': f"{namespace}/{local_id}",
                'desc': f"Доступны возможные совпадения",
                'idMembers' : [trelloAppMemberId]
            }

            cardCreated = False
            retryCount = 0

            while((not cardCreated) and (retryCount < maxCardCreationRetryCount)):
                response = requests.request(
                    "POST",
                    url,
                    params=query
                )

                if response.ok:
                    cardCreated = True
                    result = response.json()
                    cardID = result['id']
                    print("{0}: Successfully created Trello card. ID is {1}".format(uid, cardID))

                    url = f"https://api.trello.com/1/cards/{cardID}/attachments"
                    headers = {
                        "Accept": "application/json"
                    }
                    
                    #attaching image
                    query = {
                        'key': trelloKey,
                        'token': trelloToken,
                        'mimeType':'image/jpeg',
                        'name': 'фото.jpg',
                        'setCover': True
                    }

                    response = requests.request(
                        "POST",
                        url,
                        files=dict(file=base64.decodebytes(job['annotated_images'][0]['data'].encode("utf-8"))),
                        headers=headers,
                        params=query
                    )
                    if response.ok:
                        print("{0}: Successfully added photo attachment Trello card. ID is {1}".format(uid, cardID))
                    else:
                        print("{0}: Error during attaching photo to Trello card; http code {1}; {2}".format(uid, response.status_code, response.text))

                    # attaching URL
                    query = {
                        'key': trelloKey,
                        'token': trelloToken,
                        'url': f"https://kashtanka.pet/#/candidatesReview/{namespace}/{local_id}"
                    }

                    response = requests.request(
                        "POST",
                        url,
                        headers=headers,
                        params=query
                        )
                    if response.ok:
                        print("{0}: Successfully added URL attachment Trello card. ID is {1}".format(uid, cardID))
                    else:
                        print("{0}: Error during attaching URL to Trello card; http code {1}; {2}".format(uid, response.status_code, response.text))
                    


                else:
                    retryCount += 1
                    print("{0}: Error during creation of Trello card: http code {1}, {2}".format(uid,response.status_code, response.text))
            #annotatedImage = job['annotated_images'][0]
            if retryCount == maxCardCreationRetryCount:
                print("{0}: Error during creation of Trello card".format(uid))
                exit(1)
        else:
            print("{0}: Card is either not of Found type, or does not contain images".format(uid))
            
        print("{0}: Job is done. Committing".format(uid))
        worker.Commit()
        print("{0}: Commited".format(uid))
    

asyncio.run(work(),debug=False)