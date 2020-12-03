import * as DataModel from '../DataModel'
import ICardStorage from './ICardStorage'

// REST API specific data model follows

export enum CardType { Found = "found", Lost = "lost" }
export enum Animal { Cat = "cat", Dog = "dog" }
export enum Sex { Unknown = "unknown", Male = "male", Female = "female" }

export type AnnotatedImage = {
    ID: number;
    srcUrl: string;
}

type Location = {
    address: string;
    lat: number;
    lon: number;
}

interface FeaturesDict {
    [key: string]: number[]
}

export type AnimalCard = {
    cardType: CardType;
    contactInfo: {
        comment: string;
    }
    animal: Animal;
    eventTime: string; // iso string
    cardCreationTime: string; // iso string
    location: Location;
    animalSex: Sex;
    photos: AnnotatedImage[];
    provenanceURL: string;
    features: FeaturesDict;
}

export class CardStorage implements ICardStorage {
    private serviceURL: string;

    constructor(serviceURL: string) {
        this.serviceURL = serviceURL;
    }
    GetPetCardByFullID(fullID: string): Promise<DataModel.AnimalCard> {
        const split = fullID.split('/')
        if (split.length !== 2)
            throw "Can't find / in the full id " + fullID
        return this.GetPetCard(split[0], split[1])
    }

    GetPetCard(namespace: string, localID: string): Promise<DataModel.AnimalCard> {
        var cardURL = this.serviceURL + "/PetCards/" + namespace + "/" + localID;
        var cardInfoPromise = fetch(cardURL).then(response =>
            response.json().then(data => ({
                data: data,
                status: response.status
            })
            ));

        const photosURL = this.serviceURL + "/PetPhotos/" + namespace + "/" + localID;
        var cardPhotosPromise = fetch(photosURL).then(response =>
            response.json().then(data => ({
                data: data,
                status: response.status
            })
            ));
            
        return Promise.all([cardInfoPromise, cardPhotosPromise]).then((values) => {
            const photosArr: AnnotatedImage[] = values[1].data.map((i: { imageNum: number }) => {
                    return {
                        ID: i.imageNum,
                        srcUrl: this.serviceURL + "/PetPhotos/" + namespace + "/" + localID + "/" + i.imageNum + "/annotated"
                    }
                });
            var downloadedCard: AnimalCard = values[0].data;
            var card: DataModel.AnimalCard = {
                namespace: namespace,
                id: localID,
                animal: downloadedCard.animal,
                animalSex: downloadedCard.animalSex,
                cardCreationTime: new Date(downloadedCard.cardCreationTime),
                cardType: downloadedCard.cardType,
                contactInfo: downloadedCard.contactInfo,
                eventTime: new Date(downloadedCard.eventTime),
                features: downloadedCard.features,
                location: downloadedCard.location,
                photos: photosArr,
                provenanceURL: downloadedCard.provenanceURL
            }
            return card;
        });
    }
}