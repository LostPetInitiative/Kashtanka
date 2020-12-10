import * as React from "react";
import * as DataModel from "./DataModel"
import ICardStorage from "./apiClients/ICardStorage"
import * as ISearch from "./apiClients/ISearch"
import * as Thumbnails from "./CandidatesThumbnails"
import * as TwoCards from "./TwoCards"
import "./CandidatesReview.scss"

type PropsType = {
    cardStorage: ICardStorage,
    searcher: ISearch.ISearch,
    mainCardFullID: string,
    candCardFullID: string,
    candCardFullIDChanged: (newCandCardFullID: string) => void
}
type StateType = {
    shownMainFullID: string,
    shownMainCard: DataModel.AnimalCard | null,
    shownCandFullID: string,
    shownCandCard: DataModel.AnimalCard | null
}

class CandidatesReview extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props)

        this.state = {
            shownMainFullID: "",
            shownCandFullID: "",
            shownMainCard: null,
            shownCandCard: null
        }
    }

    checkLoadedData() {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных - Сравнение объявлений"

        if (this.state.shownMainFullID !== this.props.mainCardFullID) {
            this.setState({
                shownMainFullID: this.props.mainCardFullID,
                shownMainCard: null
            })
            if (this.props.mainCardFullID !== "") {
                const that = this;
                console.log("Fetching main card " + this.props.mainCardFullID)
                this.props.cardStorage.GetPetCardByFullID(this.props.mainCardFullID).then(card => {
                    const downloadedCardId = card.namespace + "/" + card.id
                    if (that.state.shownMainFullID === downloadedCardId) {
                        console.log("Got main card " + this.props.mainCardFullID)
                        this.setState({ shownMainCard: card })
                    } else {
                        console.log("Got stale request main card " + this.props.mainCardFullID + ". Ignoring")
                    }
                });
            }
        }

        if (this.state.shownCandFullID !== this.props.candCardFullID) {
            this.setState({
                shownCandFullID: this.props.candCardFullID,
                shownCandCard: null
            })
            if (this.props.candCardFullID !== "") {
                const that = this;
                console.log("Fetching cand card " + this.props.candCardFullID)
                this.props.cardStorage.GetPetCardByFullID(this.props.candCardFullID).then(card => {
                    const downloadedCardId = card.namespace + "/" + card.id
                    if (that.state.shownCandFullID === downloadedCardId) {
                        console.log("Got cand card " + this.props.candCardFullID)
                        this.setState({ shownCandCard: card })
                    } else {
                        console.log("Got stale request cand card " + this.props.candCardFullID + ". Ignoring")
                    }
                });
            }
        }
    }

    componentDidMount() {
        this.checkLoadedData()
    }

    componentDidUpdate() {
        this.checkLoadedData()
    }

    renderUpperScreen() {
        var leftCardAssignment: TwoCards.CardAssignment = "loading";
        var rightCardAssignment: TwoCards.CardAssignment = "loading";

        // while the main card is not loaded we do not know whether it is Lost or Found card
        // thus we don't know whether it is at left or right pard
        // so both parts are marked as Loading
        if (this.state.shownMainCard !== null) {
            const card = this.state.shownMainCard

            const isLostCard = card.cardType === DataModel.CardType.Found
            if (isLostCard) {
                // Found cards are presented at the left part
                leftCardAssignment = card
                if (this.state.shownCandCard !== null) {
                    rightCardAssignment = this.state.shownCandCard
                } else if (this.state.shownCandFullID === "") {
                    rightCardAssignment = "unassigned"
                }
            } else {
                rightCardAssignment = card
                if (this.state.shownCandCard !== null) {
                    leftCardAssignment = this.state.shownCandCard
                } else if (this.state.shownCandFullID === "") {
                    leftCardAssignment = "unassigned"
                }
            }
        }

        return (
            <div className="upper-screen">
                <TwoCards.TwoCardsViewer leftCard={leftCardAssignment} rightCard={rightCardAssignment} />
            </div>
        )
    }

    handleSelectionChanged(newCandFullID: string) {
        // passing up the event to the parent
        if (this.props.candCardFullIDChanged !== null) {
            this.props.candCardFullIDChanged(newCandFullID)
        }
    }

    renderLowerScreen() {
        const mainCard = (this.state.shownMainCard !== null) ? this.state.shownMainCard : null;
        return (
            <div className="lower-screen">
                <Thumbnails.CandidatesThumbnails
                    referenceCard={mainCard}
                    selectedCardFullID={this.state.shownCandFullID}
                    selectionChanged={(newFullID) => this.handleSelectionChanged(newFullID)}
                    searcher={this.props.searcher}
                    cardStorage={this.props.cardStorage}
                />
            </div>
        )
    }

    render() {
        const upperScreen = this.renderUpperScreen()
        const lowerScreen = this.renderLowerScreen()
        return (
            <div className="CandidatesReview">
                {upperScreen}
                {lowerScreen}
            </div>
        )
    }

}

export default CandidatesReview;