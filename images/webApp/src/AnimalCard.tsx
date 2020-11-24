import * as React from "react";

import AnimalPhotos from "./AnimalPhotos";
import * as DataModel from  "./DataModel";

function AnimalCard(props : {card: DataModel.AnimalCard}) {
    const card = props.card;

    function animalTypeString(animalType: DataModel.Animal) {
        if(animalType == DataModel.Animal.Dog)
            return "Собака";
        else if(animalType == DataModel.Animal.Cat)
            return "Кошка";
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
            return "foundCardHeader";
        else if(cardType == DataModel.CardType.Lost)
            return "lostCardHeader";
        else return "";
    }

    return (
        <div className="animalCard">
            <div className={cardTypeClass(card.cardType) + " cardHeader"}>{cardTypeString(card.cardType)}</div>
            <div>{animalTypeString(card.animal)}</div>
            <div className="animalGender">{"(" + animalGenderString(card.animalSex) + ")"}</div>
            <div>
                <div className="cardItemHeader">Когда?</div>
                <div>{new Date(card.eventTime).toLocaleString()}</div>
            </div>
            <div>
                <div className="cardItemHeader">Где?</div>
                <div className="cardCoordsNumbers">{card.location.lat + ", " + card.location.lon}</div>
            </div>
            {/* <div>{card.color}</div>
            <div>{card.size}</div> */}
            <div><AnimalPhotos photos={card.photos} /></div>
        </div>
    );
  }

export default AnimalCard;