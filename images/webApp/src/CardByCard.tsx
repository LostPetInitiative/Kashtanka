import * as React from "react";
import "./apiClients/ICardStorage"
import "./"
import ICardStorage from "./apiClients/ICardStorage";
import CardViewer from "./AnimalCard"
import * as DataModel from "./DataModel"

function CardPromiseViewer(props: { cardPromise: Promise<DataModel.AnimalCard> }) {
    const [card, setCard] = React.useState<DataModel.AnimalCard | null>(null)

    props.cardPromise.then(loadedCard => {
        console.log("Card loaded")
        setCard(loadedCard)
    });

    return (
        <div>
            { card === null &&
                <p>Loading...</p>
            }
            { card !== null &&
                <CardViewer card={card} />
            }
        </div>
    )
}

function CardByCard(props: { cardStorage: ICardStorage }) {
    var paramsString = window.location.search;
    var searchParams = new URLSearchParams(paramsString);

    const cardNamespace = searchParams.has("namespace") ? searchParams.get("namespace") : null;
    const cardId = searchParams.has("id") ? searchParams.get("id") : null;

    var cardLoadPromise: Promise<DataModel.AnimalCard> | null = null;
    if ((cardNamespace !== null) && (cardId !== null)) {
        console.log("Loading " + cardNamespace + "/" + cardId + "...")
        cardLoadPromise = props.cardStorage.GetPetCard(cardNamespace, cardId);        
    } else {
        console.log("card identifier not found in query string")
    }


    return (
        <div>
            <h2>Card by card viewer</h2>
            {
                cardLoadPromise === null &&
                <p>Не назначена карточка</p>
            }
            {
                cardLoadPromise !== null &&
                    <CardPromiseViewer cardPromise={cardLoadPromise} />
            }
        </div>
    )
}

export default CardByCard;