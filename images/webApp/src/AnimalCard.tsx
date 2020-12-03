import * as React from "react";
import "./AnimalCard.scss"
import AnimalPhotos from "./AnimalPhotos";
import * as DataModel from  "./DataModel";
import CarouselImgViewer from "./CarouselImgViewer";

function AnimalCard(props : {card: DataModel.AnimalCard}) {
    const card = props.card;

    function animalType(animalType: DataModel.Animal, animalGender: DataModel.Sex) {
        if(animalType == DataModel.Animal.Dog)
            return <img src="./img/dog/dogFaceWhite.png" className="animalTypeImg"/>;
        else if(animalType == DataModel.Animal.Cat) {
            if(animalGender == DataModel.Sex.Female)
                return <img src="./img/cat/pinkCat.png" className="animalTypeImg"/>;
            else if(animalGender == DataModel.Sex.Male)
                return <img src="./img/cat/blueCat.png" className="animalTypeImg"/>;
            return  <img src="./img/cat/catFaceWhite.png" className="animalTypeImg"/>;
        }
        else return "Животное";
    }

    function animalGenderString(animalGender: DataModel.Sex) {
        if(animalGender == DataModel.Sex.Female)
            return "Девочка";
        else if(animalGender == DataModel.Sex.Male)
            return "Мальчик";
        else return "";
    }

    function cardTypeString(cardType: DataModel.CardType) {
        if(cardType == DataModel.CardType.Found)
            return "Нашёлся";
        else if(cardType == DataModel.CardType.Lost)
            return "Потерялся";
        else return "";
    }

    function cardTypeClass(cardType: DataModel.CardType) {
        if(cardType == DataModel.CardType.Found)
            return "leftOriented";
        else if(cardType == DataModel.CardType.Lost)
            return "rightOriented";
        else return "";
    }

    var cardStyle = {"max-width":"400px"} as React.CSSProperties;

    return (
        <div style={cardStyle} className="animalCard">
            <div className={"cardHeader " + cardTypeClass(card.cardType)}> {cardTypeString(card.cardType)} </div>
            <div className={"animalType " + cardTypeClass(card.cardType)}> {animalType(card.animal, card.animalSex)} </div>
            <div className={"cardImgViewer " + cardTypeClass(card.cardType)}>
                <CarouselImgViewer imgSrcArray={card.photos}></CarouselImgViewer>
            </div>
            <div className={"cardInfo " + cardTypeClass(card.cardType)}>
                <div className="cardDate" title="Когда?"> {card.eventTime.toLocaleDateString()} </div>
                <div className="cardCoordsNumbers" title="Где?"> {card.location.address} </div>
            </div>
            <div className={"cardComment " + cardTypeClass(card.cardType)}>
                <div className="cardItemHeader"> Комментарий </div>
                <div> {card.contactInfo.comment} </div>
            </div>
        </div>
    );
  }

export default AnimalCard;