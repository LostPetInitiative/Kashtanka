import * as React from "react";
import * as DataModel from "./DataModel"
import * as ICardStorage from "./apiClients/ICardStorage"
import * as ISearch from "./apiClients/ISearch"
import * as Thumbnails from "./CandidatesThumbnails"
import * as TwoCards from "./TwoCards"
import "./CandidatesReview.scss"

type PropsType = {
    cardStorage: ICardStorage.ICardStorage,
    searcher: ISearch.ISearch,
    mainCardFullID: string,
    candCardFullID: string,
    candCardFullIDChanged: (newCandCardFullID: string) => void
}
type StateType = {
    shownMainFullID: string,
    shownMainCard: DataModel.AnimalCard | "Loading" | "DoesNotExist" | "NotSet",
    shownCandFullID: string,
    shownCandCard: DataModel.AnimalCard | "Loading" | "DoesNotExist" | "NotSet"
}

class CandidatesReview extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props)

        this.state = {
            shownMainFullID: "",
            shownCandFullID: "",
            shownMainCard: "NotSet",
            shownCandCard: "NotSet"
        }
    }

    checkLoadedData() {
        document.title = "Каштанка - автоматический поиск потерянных и найденных домашних животных - Сравнение объявлений"

        if (this.state.shownMainFullID !== this.props.mainCardFullID) {
            this.setState({
                shownMainFullID: this.props.mainCardFullID,
                shownMainCard: (this.props.mainCardFullID !== "") ? "Loading" : "NotSet"
            })
            if (this.props.mainCardFullID !== "") {
                const that = this;
                console.log("Fetching main card " + this.props.mainCardFullID)
                this.props.cardStorage.GetPetCardByFullID(this.props.mainCardFullID).then(result => {
                    if (ICardStorage.isUnexistentCardToken(result)) {
                        const checkedCardId = result.UnexistentCardNamespace + "/" + result.UnexistentCardID
                        if (that.state.shownMainFullID === checkedCardId) {
                            console.warn("Got \"card does not exist in the storage\" main card reply")
                            this.setState({ shownMainCard: "DoesNotExist" })
                        } else {
                            console.log("Got stale non-existent reply for request main card " + this.props.mainCardFullID + ". Ignoring")
                        }
                    }
                    else {
                        const card = result
                        const downloadedCardId = card.namespace + "/" + card.id
                        if (that.state.shownMainFullID === downloadedCardId) {
                            console.log("Got main card " + this.props.mainCardFullID)
                            this.setState({ shownMainCard: card })
                        } else {
                            console.log("Got stale reply for request main card " + this.props.mainCardFullID + ". Ignoring")
                        }
                    }
                });
            }
        }

        if (this.state.shownCandFullID !== this.props.candCardFullID) {
            this.setState({
                shownCandFullID: this.props.candCardFullID,
                shownCandCard: (this.props.candCardFullID !== "") ? "Loading" : "NotSet"
            })
            if (this.props.candCardFullID !== "") {
                const that = this;
                console.log("Fetching cand card " + this.props.candCardFullID)
                this.props.cardStorage.GetPetCardByFullID(this.props.candCardFullID).then(result => {
                    if (ICardStorage.isUnexistentCardToken(result)) {
                        const checkedCardId = result.UnexistentCardNamespace + "/" + result.UnexistentCardID
                        if (that.state.shownMainFullID === checkedCardId) {
                            console.warn("Got \"card does not exist in the storage\" cand card reply")
                            this.setState({ shownCandCard: "DoesNotExist" })
                        } else {
                            console.log("Got stale non-existent reply for request cand card " + this.props.mainCardFullID + ". Ignoring")
                        }
                    } else {
                        const card = result
                        const downloadedCardId = card.namespace + "/" + card.id
                        if (that.state.shownCandFullID === downloadedCardId) {
                            console.log("Got cand card " + this.props.candCardFullID)
                            this.setState({ shownCandCard: card })
                        } else {
                            console.log("Got stale request cand card " + this.props.candCardFullID + ". Ignoring")
                        }
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

    static cardStateToCardAssignement(cardState:DataModel.AnimalCard | "Loading" | "DoesNotExist" | "NotSet"):TwoCards.CardAssignment {
        if (cardState === "DoesNotExist") {
            return "unexistent"
        } else if (cardState === "NotSet") {
            return "unassigned"
        } else if (cardState === "Loading") {
            return  "loading"
        } else {
            return cardState
        }
    }

    renderUpperScreen() {
        var leftCardAssignment: TwoCards.CardAssignment;
        var rightCardAssignment: TwoCards.CardAssignment;

        const mainCardAssignment = CandidatesReview.cardStateToCardAssignement(this.state.shownMainCard)
        switch(mainCardAssignment)
        {
            case "unexistent":
            case "unassigned":
            case "loading":
                // while the main card is not loaded or not set we do not know whether it is Lost or Found card
                // thus we don't know whether it is at left or right pard
                // so both parts are marked as Loading
                leftCardAssignment = mainCardAssignment
                rightCardAssignment = mainCardAssignment
                break;
            default:
                const card = mainCardAssignment
                const depCardAssignment = CandidatesReview.cardStateToCardAssignement(this.state.shownCandCard)
                const isLostCard = card.cardType === DataModel.CardType.Found
                if (isLostCard) {
                    // Found cards are presented at the left part
                    leftCardAssignment = card
                    rightCardAssignment = depCardAssignment
                } else {
                    rightCardAssignment = card
                    leftCardAssignment = depCardAssignment
                }
                break;
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
        var lowerContent
        switch(this.state.shownMainCard) {
            case "DoesNotExist":
            case "NotSet":
                lowerContent = false
                break
            case "Loading":
            default:
                const mainCard = this.state.shownMainCard === "Loading" ? null : this.state.shownMainCard
                lowerContent = <Thumbnails.CandidatesThumbnails
                                referenceCard={mainCard}
                                selectedCardFullID={this.state.shownCandFullID}
                                selectionChanged={(newFullID) => this.handleSelectionChanged(newFullID)}
                                searcher={this.props.searcher}
                                cardStorage={this.props.cardStorage} />
        }
        return (
            <div className="lower-screen">
                {lowerContent}
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