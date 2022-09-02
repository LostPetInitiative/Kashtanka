import kafkajobs
import argparse
import pathlib
import tqdm
import os
import pet911


parser = argparse.ArgumentParser(description='Submit a pet card to the pipeline')
parser.add_argument('--card_path', type=pathlib.Path, nargs='?', help='path to the card to submit')
parser.add_argument('--cards_path', type=pathlib.Path, nargs='?', help='path to the cards to submit')
parser.add_argument('--cards_to_skip', type=int, nargs='?', help='how many cards from cards_path to skip',default=0)
parser.add_argument('kafka_url', type=str, nargs='?', help='kafka host:port (e.g. kafka-cluster.kashtanka:9092)',default="kafka-cluster.kashtanka:9092")
parser.add_argument('output_queue', type=str, nargs='?', help='name of the output queue to submit card to',default="kashtanka_crawled_pet_cards")

args = parser.parse_args()

cardDir = args.card_path
cardsDir = args.cards_path
cardsToSkip = args.cards_to_skip
kafkaUrl = args.kafka_url
outputQueueName = args.output_queue


producer = kafkajobs.jobqueue.JobQueueProducer(kafkaUrl, outputQueueName, "Crawler-pet911ru-pipeline-submitter")

if not (cardDir is None):
    print(f"Submitting single card from {cardDir}")
    cardJson = pet911.GetPetCard(str(cardDir))
    print("card loaded")
    #print(cardJson)

    print("Submitting...")
    producer.Enqueue(cardJson['uid'], cardJson)
    print("Successfully submitted")
elif not (args.cards_path is None):
    print(f"Submitting all cards from {cardsDir}")
    subdirs = [x for x in os.listdir(cardsDir) if x.startswith("rl") or x.startswith("rf")]
    subdirs.sort()
    print(f"{len(subdirs) - cardsToSkip} cards to submit")
    if(cardsToSkip > 0):        
        print(f"{cardsToSkip} cards to skip skipped")
    subdirs = subdirs[cardsToSkip:] 
    for subdir in tqdm.tqdm(subdirs, ascii=True, desc="Submitting to kafka"):
        fullPath = os.path.join(cardsDir, subdir)
        cardJson = pet911.GetPetCard(str(fullPath))
        if(cardJson is None):
            continue
        producer.Enqueue(cardJson['uid'], cardJson)
    print("Successfully submitted")
else:
    print("Please specify a single card path or cards dir to submit")
    exit(1)



