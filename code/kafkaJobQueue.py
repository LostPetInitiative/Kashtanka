import kafka
import json
from kafka.admin import KafkaAdminClient, NewTopic

def strSerializer(jobName):
    return jobName.encode('utf-8')

def dictSerializer(job):
    #print(type(job))
    #print(job)
    return json.dumps(job, indent=2).encode('utf-8')

class JobQueue:
    def __init__(self, kafkaBootstrapUrl,topicName, appName, num_partitions=32, replication_factor=3):
        self.kafkaBootstrapUrl = kafkaBootstrapUrl
        self.topicName = topicName
        self.appName = appName
        admin_client = KafkaAdminClient(
            bootstrap_servers=kafkaBootstrapUrl, 
            client_id=appName
            )

        topic_list = []
        topic_list.append(NewTopic(name=topicName, num_partitions=num_partitions, replication_factor=replication_factor))
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