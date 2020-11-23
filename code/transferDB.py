from tqdm import tqdm
import pet911
import os
import requests
import sys
import argparse

CHECKPOINT_FILE_NAME=".already_transfered"

parser = argparse.ArgumentParser(description='Transfer the pet cards db content')

parser.add_argument('source', type=str,
                    help='path to the predownloaded pet911ru cards')
parser.add_argument('destination', type=str,
                    help='address of kafka rest API')

args = parser.parse_args()

print("Loading cards from {0} into {1}".format(args.source,args.destination))

cardDirs = [(x,int(x[2:])) for x in os.listdir(args.source) if (x.startswith("rf") or x.startswith("rl"))]
cardDirs.sort( key= lambda x: x[1])
cardDirs = [os.path.join(args.source,x[0]) for x in cardDirs]
print("{0} cards found in the source dir".format(len(cardDirs)))
print(cardDirs[0:5])

if os.path.exists(CHECKPOINT_FILE_NAME):
    with open(CHECKPOINT_FILE_NAME, "r") as text_file:
        already_transferred = int(text_file.read())
        print("Interrupted previous transfer session found. skipping first {0} cards".format(already_transferred))    
else:
    already_transferred = 0

cardDirs = cardDirs[already_transferred:]
print("{0} cards to transfer".format(len(cardDirs)))
for cardPath in tqdm(cardDirs, ascii=True, total=len(cardDirs)):
    card = pet911.GetPetCard(cardPath)
    uid = card['uid']
    response = requests.post(args.destination, json = card)    
    if response.status_code != 201:
        print("Got card post status code {0}".format(response.status_code))
        print("{0}: Unsuccessful status code! Error {1}".format(uid,response.text))
        break

    already_transferred += 1

    # saving checkpoint
    with open(CHECKPOINT_FILE_NAME,"w") as text_file:
        text_file.write(str(already_transferred))

print("Done")