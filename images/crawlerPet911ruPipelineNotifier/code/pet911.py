import os
import json
import time
import base64

from webptools import grant_permission,dwebp
grant_permission()

def GetPetCard(dirPath):
    '''Loads the pet card identified by the dirPath. Retuens dictionary with the pet card data.'''
    cardPath = os.path.join(dirPath,"card.json")
    #print("Pasing {0}".format(cardPath))
    if not os.path.exists(cardPath):
        #raise Exception("Can't find card.json in {0}".format(dirPath))
        return None
    with open(cardPath, 'r') as cardfile:
        card = json.loads(cardfile.read())

    exts_to_type = {
        "jpg" : "jpg",
        "jpeg": "jpg",
        "png" : "png",
        "webp": "webp"
    }

    images = []
    pet = card['pet']
    for photo in pet['photos'] :        
        photoPath = os.path.join(dirPath,photo['id'])
        imageType = "jpg"
        dotIdx = photoPath.rfind('.')
        if dotIdx != -1:
            extCandidate = photoPath[(dotIdx+1):]
            if extCandidate in exts_to_type:
                imageType = exts_to_type[extCandidate]
        if not os.path.exists(photoPath):
            # probing for jpeg and png images
            for ext in exts_to_type:
                if os.path.exists(photoPath + "." + ext):
                    imageType = exts_to_type[ext]
                    photoPath = photoPath + "." + ext
                    break

        if not os.path.exists(photoPath):
            print("The photo {0} is not on disk".format(photo['id']))
            continue

        webpConverted = False
        # re-encoding webp
        if imageType == 'webp':
            imageType = "jpg"
            dwebp(input_image=photoPath, output_image=photoPath+".jpg",option="-o", logging="-v")
            #print(dwebp(input_image=photoPath, output_image=photoPath[0:dotIdx]+".jpg",option="-o", logging="-v"))
            photoPath = photoPath+".jpg"
            #print("Webp re-encoded to jpeg")            
            webpConverted = True
        
        with open(photoPath, 'rb') as photoFile:
            photo = photoFile.read()

            image = {
                'type': imageType,
                'data': base64.encodebytes(photo).decode("utf-8").replace("\n","")
            }
            images.append(image)
        if webpConverted:
            # removing JPEG to save some space
            os.remove(photoPath)
    
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
    