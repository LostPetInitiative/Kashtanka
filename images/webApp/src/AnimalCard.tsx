import * as React from "react";
import "./AnimalCard.css"
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

    var commentStyle = {"margin":"16px"} as React.CSSProperties;
    var cardStyle = {"max-width":"600px"} as React.CSSProperties;

    return (
        <div style={cardStyle} className="animalCard">
            <div className={cardTypeClass(card.cardType) + " cardHeader"}>{cardTypeString(card.cardType)}</div>
            <div>{animalTypeString(card.animal)}</div>
            <div className="animalGender">{"(" + animalGenderString(card.animalSex) + ")"}</div>
            <br/>
            <div>
                <div className="cardItemHeader">Когда?</div>
                <div>{new Date(card.eventTime).toDateString()}</div>
            </div>
            <br/>
            <div>
                <div className="cardItemHeader">Где?</div>
                <div className="cardCoordsNumbers">{card.location.address}</div>
            </div>
            <br/>
            <div><AnimalPhotos photos={card.photos} /></div>
            <hr/>
            <p style={commentStyle}>{card.contactInfo.comment}</p>
        </div>
    );
  }

export default AnimalCard;