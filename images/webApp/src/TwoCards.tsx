import * as React from "react";
import "./apiClients/ICardStorage"
import "./TwoCards.css"
import CardDiffViewer from "./CardDiffViewer"
import * as DataModel from "./DataModel"
import AnimalCard from "./AnimalCard";

export type CardAssignment = DataModel.AnimalCard | "unassigned" | "loading" | "unexistent"

type PropsType = {
    leftCard: CardAssignment,
    rightCard: CardAssignment,
}

export function TwoCardsViewer(props: PropsType) {
    function getCardViewer(card: CardAssignment) {
        switch(card) {
            case "loading": return <p>Загрузка...</p>;
            case "unassigned": return <p>Карточка не выбрана. Выберите карточку из списка снизу.</p>;
            case "unexistent": return <p>Карточка не найдена.</p>
            default: return <AnimalCard card={card} />
        }
    }

    
    function getMiddleViewer(leftCard: CardAssignment, rightCard:CardAssignment) {
        function isAssignedCard(card: CardAssignment): card is DataModel.AnimalCard {
            return !(typeof card === 'string' || card instanceof String)
        }
    
        if (isAssignedCard(leftCard) && isAssignedCard(rightCard)) {
            return <CardDiffViewer card1={leftCard} card2={rightCard} />
        } else return <div></div>;
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