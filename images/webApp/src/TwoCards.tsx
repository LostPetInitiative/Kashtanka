import * as React from "react";
import "./apiClients/ICardStorage"
import "./TwoCards.css"
import ICardStorage from "./apiClients/ICardStorage";
import CardViewer from "./AnimalCard"
import CardDiffViewer from "./CardDiffViewer"
import * as DataModel from "./DataModel"
import AnimalCard from "./AnimalCard";

type PropsType = {cardStorage: ICardStorage}
type StateType = {
    leftCard : DataModel.AnimalCard | null,
    rightCard : DataModel.AnimalCard | null
}

class TwoCardsViewer extends React.Component<PropsType,StateType> {
    constructor(props: PropsType) {
        super(props);

        const initialState = {
            leftCard : null,
            rightCard : null
        }

        this.state = initialState
    }

    componentDidMount() {
        // initiating loading of the cards

        var paramsString = window.location.search;
        var searchParams = new URLSearchParams(paramsString);

        console.log("Two Cards rendering")

        const cardNamespace = searchParams.has("namespace") ? searchParams.get("namespace") : null;
        const cardId = searchParams.has("id") ? searchParams.get("id") : null;

        if ((cardNamespace !== null) && (cardId !== null)) {
            console.log("Loading " + cardNamespace + "/" + cardId + "...")
            this.props.cardStorage.GetPetCard(cardNamespace, cardId).then(card => {
                this.setState({rightCard : card})
            })
        }

        
        this.props.cardStorage.GetPetCard("pet911ru", "rl100268").then(card => {
            this.setState({leftCard: card})
        })
    }

    getLeftViewer() {
        if(this.state.leftCard === null) {
            return <p>Загрузка...</p>;
        } else {
            return <AnimalCard card={this.state.leftCard}/>
        }
    }

    getRightViewer() {
        if(this.state.rightCard ===null) {
            return <p>Загрузка...</p>;
        } else {
            return <AnimalCard card={this.state.rightCard}/>
        }
    }

    getMiddleViewer() {
        if((this.state.leftCard !== null) && (this.state.rightCard !== null)) {
            const left = this.state.leftCard as DataModel.AnimalCard;
            const right = this.state.rightCard as DataModel.AnimalCard;
            return <CardDiffViewer card1={left} card2={right} />
        } else return false;
    }

    render() {
        const leftViewer = this.getLeftViewer();
        const rightViewer = this.getRightViewer();
        const middleViewer = this.getMiddleViewer();
        return (
            <div className="gridContainer">
                {leftViewer}
                {middleViewer}
                {rightViewer}
            </div>
        )
    }
}

export default TwoCardsViewer;