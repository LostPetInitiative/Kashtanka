import * as React from "react";
import "./apiClients/ICardStorage"
import "./TwoCards.css"
import ICardStorage from "./apiClients/ICardStorage";
import CardDiffViewer from "./CardDiffViewer"
import * as DataModel from "./DataModel"
import AnimalCard from "./AnimalCard";

type PropsType = {
    cardStorage: ICardStorage,
    ns1: string,
    id1: string,
    ns2: string,
    id2: string
}
type StateType = {
    leftCard: DataModel.AnimalCard | null,
    rightCard: DataModel.AnimalCard | null,
    leftFullId: string,
    rightFullId: string
}

class TwoCardsViewer extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props);

        const initialState = {
            leftCard: null,
            rightCard: null,
            leftFullId: "",
            rightFullId: ""
        }

        this.state = initialState
    }

    checkCardsForLoad() {
        const newLeftFullID = this.props.ns1 + "/" + this.props.id1
        if (newLeftFullID != this.state.leftFullId) {
            console.log("loading left card "+newLeftFullID)
            this.setState({ leftFullId: newLeftFullID, leftCard: null })
            this.props.cardStorage.GetPetCard(this.props.ns1, this.props.id1).then(card => {
                this.setState({ leftCard: card })
            })
        }

        const newRightFullID = this.props.ns2 + "/" + this.props.id2
        if (newRightFullID != this.state.rightFullId) {
            console.log("loading right card "+newRightFullID)
            this.setState({ rightFullId: newRightFullID, rightCard: null })
            this.props.cardStorage.GetPetCard(this.props.ns2, this.props.id2).then(card => {
                this.setState({ rightCard: card })
            })
        }
    }

    componentDidMount() { this.checkCardsForLoad() }

    componentDidUpdate() { this.checkCardsForLoad() }

    getLeftViewer() {
        if (this.state.leftCard === null) {
            return <p>Загрузка...</p>;
        } else {
            return <AnimalCard card={this.state.leftCard} />
        }
    }

    getRightViewer() {
        if (this.state.rightCard === null) {
            return <p>Загрузка...</p>;
        } else {
            return <AnimalCard card={this.state.rightCard} />
        }
    }

    getMiddleViewer() {
        if ((this.state.leftCard !== null) && (this.state.rightCard !== null)) {
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