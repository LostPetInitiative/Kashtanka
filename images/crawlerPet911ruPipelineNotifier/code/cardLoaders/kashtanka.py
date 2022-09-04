import os
import json
from kafkajobs.serialization.image import imageNpToB64SerializedStruct
import imageio.v3 as iio
from jsonschema import validate

schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "uid": {
      "type": "string"
    },
    "animal": {
      "type": "string"
    },
    "location": {
      "type": "object",
      "properties": {
        "Address": {
          "type": "string"
        },
        "Lat": {
          "type": "number"
        },
        "Lon": {
          "type": "number"
        },
        "CoordsProvenance": {
          "type": "string"
        }
      },
      "required": ["Lat","Lon","CoordsProvenance"]
    },
    "event_time": {
      "type": "string"
    },
    "event_time_provenance": {
      "type": "string"
    },
    "card_type": {
      "type": "string"
    },
    "contact_info": {
      "type": "object",
      "properties": {
        "Comment": {
          "type": "string"
        },
        "Tel": {
          "type": "array",
          "items": [
            {
              "type": "string"
            }
          ]
        },
        "Website": {
          "type": "array",
          "items": [
            {
              "type": "string"
            }
          ]
        },
        "Email": {
          "type": "array",
          "items": [
            {
              "type": "string"
            }
          ]
        },
        "Name": {
          "type": "string"
        }
      },
    },
    "images": {
      "type": "array",
      "items": [
        {
          "type": "object",
          "properties": {
            "type": {
              "type": "string"
            },
            "data": {
              "type": "string"
            }
          },
          "required": [
            "type",
            "data"
          ]
        }
      ]
    },
    "provenance_url": {
      "type": "string"
    }
  },
  "required": [
    "uid",
    "animal",
    "location",
    "event_time",
    "event_time_provenance",
    "card_type",
    "provenance_url"
  ]
}

def GetPetCard(dirPath):
    '''Loads the pet card identified by the dirPath. Retuens dictionary with the pet card data.'''
    cardPath = os.path.join(dirPath,"card.json")
    #print("Pasing {0}".format(cardPath))
    if not os.path.exists(cardPath):
        #raise Exception("Can't find card.json in {0}".format(dirPath))
        return None
    with open(cardPath, 'r') as cardfile:
        card = json.loads(cardfile.read())
        validate(instance=card,schema=schema)
        # print(f"Loaded valid json card from {cardPath}")
        # print(card)

    N = len(card['images'])
    for i in range(0,N):
        image = card['images'][i]
        # encoding images
        if image['type'] == 'file':
            imFile = image['data']
            imPath = os.path.join(dirPath, imFile)
            imNumpy = iio.imread(imPath)
            card['images'][i] = imageNpToB64SerializedStruct(imNumpy)

    # print("encoded")
    # print(card)
    return card
    