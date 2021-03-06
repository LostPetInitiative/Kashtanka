import os
import json
import time
import base64

def GetPetCard(dirPath):
    cardPath = os.path.join(dirPath,"card.json")
    #print("Pasing {0}".format(cardPath))
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
            continue
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
        print(f"unknown pet type: {pet['animal']}. Returning none")
        return None

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
        print(f"Unexpected card type: {pet['type']}. Skipping")
        return None
        #raise "unknown pet.type {0}".format(pet['type'])

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
        'uid': "pet911ru_{0}".format(pet['art']),
        'animal': petKind,
        'location': location,
        'event_time': eventTime,
        'event_time_provenance': "Указано на сайте pet911.ru",
        'card_type': cardType,
        'contact_info': contactInfo,
        'images': images,
        'provenance_url': 'https://pet911.ru/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80/%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%B0/%D0%BA%D0%BE%D1%88%D0%BA%D0%B0/{0}'.format(pet['art'])
    }
    if not(petSex is None):
        result['animal_sex'] = petSex

    return result
    