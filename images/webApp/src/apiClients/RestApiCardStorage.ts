import * as DataModel from '../DataModel'
import ICardStorage from './ICardStorage'

class CardStorage implements ICardStorage {
    private serviceURL: string;

    constructor(serviceURL: string) {
        this.serviceURL = serviceURL;
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
            var photosArr: DataModel.AnnotatedImage[] = [];
            const photoNames = values[1].data.map((i: { imageNum: number; }) => {
                photosArr.push({
                    ID: i.imageNum,
                    srcUrl: this.serviceURL+"/PetPhotos/" + namespace + "/" + localID + "/" + i.imageNum + "/annotated"
                })
            });
            var card: DataModel.AnimalCard = values[0].data;
            card.photos = photosArr;
            return card;
        });
    }
}


export default CardStorage;