import kafkaJobQueue

import os

kafkaUrl = os.environ['KAFKA_URL']
jobsToDetectQueueName = os.environ['INPUT_QUEUE']

worker = kafkaJobQueue.JobQueueWorker("petDetectionWro")