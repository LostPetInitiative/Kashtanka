import * as React from "react";
import "./AnimalCard.scss"
import * as DataModel from  "./DataModel";
import CarouselImgViewer from "./CarouselImgViewer";

function AnimalCard(props : {card: DataModel.AnimalCard}) {
    const card = props.card;

    function animalType(animalType: DataModel.Animal, animalGender: DataModel.Sex) {
        if(animalType === DataModel.Animal.Dog) {
            if(animalGender === DataModel.Sex.Female)
                return <div className="iconAnimal iconDogF"/>;
            else if(animalGender === DataModel.Sex.Male)
                return <div className="iconAnimal iconDogM"/>;
            return <div className="iconAnimal iconDog"/>;
        }
        else if(animalType === DataModel.Animal.Cat) {
            if(animalGender === DataModel.Sex.Female)
                return <div className="iconAnimal iconCatF"/>;
            else if(animalGender === DataModel.Sex.Male)
                return <div className="iconAnimal iconCatM"/>;
            return  <div className="iconAnimal iconCat"/>;
        }
        else return "Животное";
    }

    function animalGenderString(animalGender: DataModel.Sex) {
        if(animalGender === DataModel.Sex.Female)
            return "Девочка";
        else if(animalGender === DataModel.Sex.Male)
            return "Мальчик";
        else return "";
    }

    function cardTypeString(cardType: DataModel.CardType) {
        if(cardType === DataModel.CardType.Found)
            return "Нашёлся";
        else if(cardType === DataModel.CardType.Lost)
            return "Потерялся";
        else return "";
    }

    function cardTypeClass(cardType: DataModel.CardType) {
        if(cardType === DataModel.CardType.Found)
            return "leftOriented";
        else if(cardType === DataModel.CardType.Lost)
            return "rightOriented";
        else return "";
    }

    return (
        <div className="animalCard">
            <div className="headerLine">
                <div className={"cardHeader " + cardTypeClass(card.cardType)}> {cardTypeString(card.cardType)} </div>
                <div className={"cardInfo " + cardTypeClass(card.cardType)} title={animalGenderString(card.animalSex)}>
                    <div className="cardDate" title="Когда?"> {card.eventTime.toLocaleDateString()} </div>
                    <div className="cardCoordsNumbers" title="Где?"> {card.location.address} </div>
                </div>
                <div className={"animalType " + cardTypeClass(card.cardType)}> {animalType(card.animal, card.animalSex)} </div>
            </div>
            <div className={"animalCardMain " + cardTypeClass(card.cardType)}>
                <div className={"cardImgViewer " + cardTypeClass(card.cardType)}>
                    <CarouselImgViewer imgSrcArray={card.photos}></CarouselImgViewer>
                </div>
                <div className={"cardComment " + cardTypeClass(card.cardType)}>
                    <div className="cardItemHeader"> Комментарий </div>
                    <div className="cardCommentText"> {card.contactInfo.comment} </div>
                </div>
            </div>
        </div>
    );
  }

export default AnimalCard;