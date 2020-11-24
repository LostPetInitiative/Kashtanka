import ICardStorage from './ICardStorage'
import * as DataModel from '../DataModel'

/// Returns hardcoded photos
// class CardStorageStub implements ICardStorage
// {
//     public GetCard(namesapce:string, localID : string) {
    
//         // service call
    
//         // emulating animal card
//         var card : DataModel.AnimalCard;
    
//         if ((localID !== null) && (localID === "dog")) {
//             card = {
//                 cardType: DataModel.CardType.Found,
//                 contactInfo: {comment: ""},
//                 animal: DataModel.Animal.Dog,
//                 eventTime: new Date(2020, 10, 7),
//                 cardCreationTime: new Date(2020, 10, 7),
//                 location: {address: "", lat: 55.699061, lon: 37.531018},
//                 provenanceURL: "",
//                 animalSex: DataModel.Sex.Male,
//                 //color: "chestnut",
//                 //size: "medium",
//                 photos: [
//                     { ID: 1, srcUrl: "./img/dog/1.jpg" },
//                     { ID: 2, srcUrl: "./img/dog/2.png" },
//                     { ID: 3, srcUrl: "./img/dog/3.png" }],
//                 features: {"exp_3_4": [3,2,1] }
//             }
//         }
//         else {
//             card = {
//                 cardType: DataModel.CardType.Lost,
//                 contactInfo: {comment: ""},
//                 animal: DataModel.Animal.Cat,
//                 eventTime: new Date(2020, 5, 27),
//                 cardCreationTime: new Date(2020, 5, 27),
//                 location: {address: "", lat: 59.933758, lon: 30.348226},
//                 provenanceURL: "",
//                 animalSex: DataModel.Sex.Female,
//                 //color = "ginger";
//                 //size = "big";
//                 photos: [
//                     { ID: 1, srcUrl: "./img/cat/1.jpg" },
//                     { ID: 2, srcUrl: "./img/cat/2.jpg" }],
//                 features: { "exp_3_4": [1,2,3] }
//             }
//         }
    
//         return card;
//     }
// }