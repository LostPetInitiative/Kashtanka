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
    cardType : CardType;
    contactInfo : {
        comment : string;
    }
    animal : Animal;
    eventTime : string; // iso string
    cardCreationTime: string; // iso string
    location: Location;
    animalSex : Sex;
    photos : AnnotatedImage[];
    provenanceURL : string;
    features : FeaturesDict;
}