import * as React from "react";
import "./apiClients/ICardStorage"
import "./TwoCards.css"
import ICardStorage from "./apiClients/ICardStorage";
import CardDiffViewer from "./CardDiffViewer"
import * as DataModel from "./DataModel"
import AnimalCard from "./AnimalCard";

export type CardAssignment = DataModel.AnimalCard | "unassigned" | "loading"

type PropsType = {
    leftCard: CardAssignment,
    rightCard: CardAssignment,
}

export function TwoCardsViewer(props: PropsType) {
    function getCardViewer(card: CardAssignment) {
        if (card === "loading") {
            return <p>Загрузка...</p>;
        } else if (card === "unassigned") {
            return <p>Карточка не выбрана. Выберите карточку из списка снизу.</p>;
        } else {
            return <AnimalCard card={card} />
        }
    }

    
    function getMiddleViewer(leftCard: CardAssignment, rightCard:CardAssignment) {
        function isAssignedCard(card: CardAssignment): card is DataModel.AnimalCard {
            return !(typeof card === 'string' || card instanceof String)
        }
    
        if (isAssignedCard(leftCard) && isAssignedCard(rightCard)) {
            return <CardDiffViewer card1={leftCard} card2={rightCard} />
        } else return false;
    }

    const leftViewer = getCardViewer(props.leftCard);
    const rightViewer = getCardViewer(props.rightCard)
    const middleViewer = getMiddleViewer(props.leftCard, props.rightCard);
    return (
        <div className="gridContainer">
            {leftViewer}
            {middleViewer}
            {rightViewer}
        </div>
    )

}