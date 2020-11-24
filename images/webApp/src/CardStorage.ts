import * as DataModel from './DataModel'

function GetCard(animal : String) {
    
    // service call

    // emulating animal card
    var card : DataModel.AnimalCard;

    if ((animal !== null) && (animal === "dog")) {
        card = {
            cardType: DataModel.CardType.Found,
            contactInfo: {comment: ""},
            animal: DataModel.Animal.Dog,
            eventTime: new Date(2020, 10, 7),
            cardCreationTime: new Date(2020, 10, 7),
            location: {address: "", lat: 55.699061, lon: 37.531018},
            provenanceURL: "",
            animalSex: DataModel.Sex.Male,
            //color: "chestnut",
            //size: "medium",
            photos: [
                { ID: 1, srcUrl: "./img/dog/1.jpg" },
                { ID: 2, srcUrl: "./img/dog/2.png" },
                { ID: 3, srcUrl: "./img/dog/3.png" }],
            features: { "exp_3_4": [] }
        }
    }
    else {
        card = {
            cardType: DataModel.CardType.Lost,
            contactInfo: {comment: ""},
            animal: DataModel.Animal.Cat,
            eventTime: new Date(2020, 5, 27),
            cardCreationTime: new Date(2020, 5, 27),
            location: {address: "", lat: 59.933758, lon: 30.348226},
            provenanceURL: "",
            animalSex: DataModel.Sex.Female,
            //color = "ginger";
            //size = "big";
            photos: [
                { ID: 1, srcUrl: "./img/cat/1.jpg" },
                { ID: 2, srcUrl: "./img/cat/2.jpg" }],
            features: { "exp_3_4": [] }
        }
    }

    return card;
}

function GetPetCard(cardID : string, cardDomain : string) {    
    const id = cardID === "" || cardID === "none" ? "101543" : cardID;
    const domain = cardDomain === "" || cardDomain === "none" ? "pet911ru" : cardDomain;

    const cardURL = "http://compute:32389/PetCards/" + domain + "/rf" + id + "/";
    var cardInfoPromise = fetch(cardURL).then(response => 
        response.json().then(data => ({
            data: data,
            status: response.status
        })
    ));

    const photosURL = "http://compute:32389/PetPhotos/" + domain + "/rf" + id + "/";
    var cardPhotosPromise = fetch(photosURL).then(response => 
        response.json().then(data => ({
            data: data,
            status: response.status
        })
    ));

    return Promise.all([cardInfoPromise, cardPhotosPromise]).then((values) => {
        var photosArr : DataModel.AnnotatedImage[] = [];
        const photoNames = values[1].data.map((i: { imageNum: number; }) => {
            photosArr.push({
                ID: i.imageNum,
                srcUrl: "http://compute:32389/PetPhotos/" + domain + "/rf" + id + "/" + i.imageNum + "/annotated"
            })
        });
        var card: DataModel.AnimalCard = values[0].data;
        card.photos = photosArr;
        return card;
    });
}

export { GetCard, GetPetCard };