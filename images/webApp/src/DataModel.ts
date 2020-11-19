enum CardType { Found, Lost }
enum Animal { Cat, Dog }
enum Sex { Unknown, Male, Female }

type AnnotatedImage = {
    ID: number;
    srcUrl: string;
}

type AnimalCard = {
    cardType : CardType;
    name : string;
    animal : AnimalCard;
    eventTime : Date;
    sex : Sex;
    photos: AnnotatedImage[];
}