import AnimalPhotos from "./AnimalPhotos.js";

function AnimalCard(props) {
    const card = props.card;
    return (
        <div class={card.animal + " животное"}>
            <div>{card.animal} {card.name}</div>
            <div>{card.eventTime.toDateString()}</div>
            <div>{card.eventPlace.join(", ")}</div>
            <div>{card.sex}</div>
            <div>{card.color}</div>
            <div>{card.size}</div>
            <div><AnimalPhotos photos={card.photos} /></div>
        </div>
    );
  }

export default AnimalCard;