import os
import json
import time
import base64

def GetPetCard(dirPath):
    cardPath = os.path.join(dirPath,"card.json")
    print("Pasing {0}".format(cardPath))
    if not os.path.exists(cardPath):
        raise "Can't find card.json in {0}".format(dirPath)
    with open(cardPath, 'r') as cardfile:
        card = json.loads(cardfile.read())
    images = []
    pet = card['pet']
    for photo in pet['photos'] :        
        photoPath = os.path.join(dirPath,"{0}.jpg".format(photo['id']))
        imageType = "jpg"
        if not os.path.exists(photoPath):
            photoPath = os.path.join(dirPath,"{0}.jpeg".format(photo['id']))
            imageType = "jpg"
        if not os.path.exists(photoPath):
            photoPath = os.path.join(dirPath,"{0}.png".format(photo['id']))
            imageType = "png"
        if not os.path.exists(photoPath):
            raise "The photo {0} is not on disk".format(photo['id'])
        with open(photoPath, 'rb') as photoFile:
            photo = photoFile.read()
            image = {
                'type': imageType,
                'data': base64.encodebytes(photo).decode("utf-8").replace("\n","")
            }
            images.append(image)
    
    if pet['animal'] == "2":
        petKind = "cat"
    elif pet['animal'] == "1":
        petKind = "dog"
    else:
        raise "unknown pet type"

    if pet['sex'] == "2":
        petSex = "male"
    elif pet['sex'] == "3":
        petSex = "female"
    else:
        petSex = None
    

    location = {
        "Address": pet['address'],
        "Lat": float(pet['latitude']),
        "Lon": float(pet['longitude']),
        "CoordsProvenance": "Указано на сайте pet911.ru"
    }

    #print("t is {0}".format(time.localtime(pet['date'])))

    eventTime = time.strftime('%Y-%m-%dT%H:%M:%SZ',time.localtime(int(pet['date'])))

    if pet['type'] == "2":
        cardType = "found"
    elif pet['type'] == "1":
        cardType = "lost"
    else:
        raise "unknown pet.type {0}".format(pet['type'])

    contactInfo = {
        "Comment": pet['description'],
        "Tel": list(),
        "Website": list(),
        "Email": list()
    }
    if ('author' in pet) and not(pet['author'] is None):
        author = pet['author']
        if ('username' in author) and not(author['username'] is None):
            contactInfo['Name'] = author['username']
        if ('phone' in author) and len(author['phone'])>0:
            contactInfo['Tel'].append(author['phone'])
        if ('email' in author) and len(author['email'])>0:
            contactInfo['Email'].append(author['email'])

    result = {
        'UID': "pet911ru_{0}".format(pet['art']),
        'pet': petKind,
        'Location': location,
        'EventTime': eventTime,
        'EventTimeProvenance': "Указано на сайте pet911.ru",
        'CardType': cardType,
        'ContactInfo': contactInfo,
        'images': images
    }
    if not(petSex is None):
        result['Sex'] = petSex

    return result
    