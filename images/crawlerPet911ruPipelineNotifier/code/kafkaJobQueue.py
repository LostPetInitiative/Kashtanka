import json
import base64
import kafka
import asyncio
from kafka.admin import KafkaAdminClient, NewTopic

def strSerializer(jobName):
    return jobName.encode('utf-8')

def strDeserializer(jobNameBytes):
    return jobNameBytes.decode('utf-8')

def dictSerializer(job):
    #print(type(job))
    #print(job)
    return json.dumps(job, indent=2).encode('utf-8')

def dictDeserializer(jobBytes):
    #print(type(job))
    #print(job)
    return json.loads(jobBytes.decode('utf-8'))

class JobQueue:
    def __init__(self, kafkaBootstrapUrl,topicName, appName, num_partitions=8, replication_factor=3, retentionHours = 7*24):
        self.kafkaBootstrapUrl = kafkaBootstrapUrl
        self.topicName = topicName
        self.appName = appName
        admin_client = KafkaAdminClient(
            bootstrap_servers=kafkaBootstrapUrl, 
            client_id=appName
            )

        topic_list = []
        topic_configs = {
            #'log.retention.hours': str(retentionHours)
        }
        topic_list.append(NewTopic(name=topicName, num_partitions=num_partitions, replication_factor=replication_factor,topic_configs=topic_configs))
        topics = admin_client.list_topics()
        if not (topicName in topics):
            try:
                admin_client.create_topics(new_topics=topic_list, validate_only=False)
                print("Topic {0} is created".format(topicName))
            except kafka.errors.TopicAlreadyExistsError:
                print("Topic {0} already exists".format(topicName))
        else:
            print("Topic {0} already exists".format(topicName))
        admin_client.close()

def get_or_create_eventloop():
    try:
        return asyncio.get_event_loop()
    except RuntimeError as ex:
        if "There is no current event loop in thread" in str(ex):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            print("Created event loop")
            return asyncio.get_event_loop()

class JobQueueProducer(JobQueue):
    '''Posts Jobs as JSON serialized python dicts'''
    def __init__(self, *args, **kwargs):
        super(JobQueueProducer, self).__init__(*args, **kwargs)

        self.producer = kafka.KafkaProducer( \
            bootstrap_servers = self.kafkaBootstrapUrl, \
            client_id = self.appName,
            key_serializer = strSerializer,
            value_serializer = dictSerializer,
            compression_type = "gzip")

    async def Enqueue(self, jobName, jobBody):
        return self.producer.send(self.topicName, value=jobBody, key= jobName)

    def EnqueueSync(self, jobName, jobBody):
        # for python < 3.7
        #loop = get_or_create_eventloop()
        loop = asyncio.get_event_loop()
        loop.run_until_complete(asyncio.wait([self.Enqueue(jobName, jobBody)]))

class JobQueueWorker(JobQueue):
    '''Fetchs sobs as JSON serialized python dicts'''
    def __init__(self, group_id, *args, **kwargs):
        super(JobQueueWorker, self).__init__(*args, **kwargs)

        self.teardown = False
        self.consumer = kafka.KafkaConsumer(self.topicName, \
            bootstrap_servers = self.kafkaBootstrapUrl, \
            client_id = self.appName,
            group_id = group_id,
            key_deserializer = strDeserializer,
            value_deserializer = dictDeserializer)

    def GetNextJob(self, pollingIntervalMs = 1000):
        extracted = False
        while (not self.teardown) and (not extracted):
            res = self.consumer.poll(pollingIntervalMs, max_records=1)
            #print("Got {0}. Len {1}".format(res,len(res)))
            if(len(res) == 1):
                for key in res:
                    jobValue = res.get(key)[0].value
                    return jobValue        

    def TryGetNextJob(self, pollingIntervalMs = 1000):
        res = self.consumer.poll(pollingIntervalMs, max_records=1)
        #print("Got {0}. Len {1}".format(res,len(res)))
        if(len(res) == 1):
            for key in res:
                jobValue = res.get(key)[0].value
                return jobValue
        else:
            return None


    def Commit(self):
        self.consumer.commit()

    def Close(self, autocommit=True):
        self.Close(autocommit)