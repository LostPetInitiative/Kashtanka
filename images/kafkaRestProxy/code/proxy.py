import sys
import kafkajobs
import requests
import os

kafkaUrl = os.environ['KAFKA_URL']
topicName = os.environ['TOPIC_NAME']
if 'OUT_TOPIC_NAME' in os.environ:
    outTopicName = os.environ['OUT_TOPIC_NAME']
else:
    outTopicName = topicName
destRestUrl = os.environ['REST_URL']

print(f'Topic name: {topicName}')
print(f'Topic output topic name: {outTopicName}')

appName = "kafka_rest_proxy"

postUrl = f"{destRestUrl}/{outTopicName}"

def main():
    consumer = kafkajobs.jobqueue.JobQueueWorker(appName, kafkaBootstrapUrl=kafkaUrl, topicName=topicName, appName=appName)
    counter = 0
    while True:
        json = consumer.GetNextJob()
        print(f"{counter}: Sending message to {postUrl} via POST")
        response = requests.post(postUrl, json = json)
        print(f"{counter}: Got post status code {response.status_code}")
        if response.status_code != 201:
            print("{0}: Unsuccessful status code! Error {1}".format(counter,response.text))
            exit(1)
        print(f"{counter}: Posted")
        consumer.Commit()
        counter +=1

main()