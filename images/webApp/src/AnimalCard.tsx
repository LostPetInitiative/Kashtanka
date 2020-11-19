import * as React from "react";

import AnimalPhotos from "./AnimalPhotos.js";
import { AnimalCard } from "./DataModel";

function AnimalCard(props : {card: AnimalCard}) {
    const card = props.card;
    return (
        <div className={card.animal + " животное"}>
            <div>{card.animal} {card.name}</div>
            <div>{card.eventTime.toDateString()}</div>
            {/* <div>{card.eventPlace.join(", ")}</div> */}
            <div>{card.sex}</div>
            {/* <div>{card.color}</div>
            <div>{card.size}</div> */}
            <div><AnimalPhotos photos={card.photos} /></div>
        </div>
    );
  }

export default AnimalCard;