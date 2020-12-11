import * as React from "react"
import * as ISearch from "./apiClients/ISearch"
import { AnimalCardThumbnailById } from "./CandidatesThumbnails"
import * as ICardsStorage from "./apiClients/ICardStorage"
import "./LatestCardsPreview.scss"

type PropsType = {
    cardsToShow: number,
    cardsTypeToShow: ISearch.LatestCardSearchType,
    searcher: ISearch.ISearch,
    cardStorage: ICardsStorage.ICardStorage,
    previewClicked: (clickedFullID: string) => void,
}

type StateType = {
    foundCards: ISearch.FoundCard[] | null,
    currentlyShownType: ISearch.LatestCardSearchType,
    currentlyShownCount: number
}

class LatestCardsPreview extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props)

        this.state = {
            foundCards: null,
            currentlyShownType: props.cardsTypeToShow,
            currentlyShownCount: NaN // nan will cause initial shown!=requested mismatch, triggering initial load
        }
    }

    tryFetchCards() {
        if ((this.state.currentlyShownCount !== this.props.cardsToShow) ||
            ((this.state.currentlyShownType !== this.props.cardsTypeToShow))) {
            console.log("Loading " + this.props.cardsTypeToShow + " (" + this.props.cardsToShow + " max count) latest cards")
            this.setState({
                currentlyShownCount: this.props.cardsToShow,
                currentlyShownType: this.props.cardsTypeToShow
            });
            this.props.searcher.GetLatestCards(this.props.cardsToShow, this.props.cardsTypeToShow).then(cards => {
                console.log("Loaded " + cards.length + " of " + this.props.cardsTypeToShow + " (" + this.props.cardsToShow + " max count) latest cards")
                this.setState({
                    foundCards: cards
                });
            });
        }
    }

    componentDidMount() {
        this.tryFetchCards()
    }

    componentDidUpdate() {
        this.tryFetchCards()
    }

    handleThumbnailClick(fullID: string, e: (React.MouseEvent | null)) {
        if (this.props.previewClicked !== null) {
            this.props.previewClicked(fullID)
        }
    }

    renderContent() {
        if (this.state.foundCards === null) {
            return <p>Загружаю самые свежие объявления...</p>
        } else {
            if (this.state.foundCards.length === 0) {
                return <p>Не удалось загрузить свежие объявления</p>
            } else {
                const cardToViewer = (card: ISearch.FoundCard, idx: number, array: ISearch.FoundCard[]) => {
                    const fullID = card.namespace + "/" + card.id
                    return (
                        <div onClick={(e) => this.handleThumbnailClick(fullID, e)} key={fullID}>
                            <AnimalCardThumbnailById
                                cardStorage={this.props.cardStorage}
                                refCard={null}
                                isAccented={false}
                                namespace={card.namespace}
                                localID={card.id}
                            />
                        </div>
                    )
                }

                const cards = this.state.foundCards.map(cardToViewer)
                return (
                        <div>
                            <p>Свежие объявления, обработанные системой:</p>
                            <div className="thumbnails-container">
                                {cards}
                            </div>
                        </div>
                )
            }
        }
    }

    render() {
        const content = this.renderContent()
        return (
            <div className="latest-cards-previews-container">
            {content}
            </div>
        )
    }
}

export default LatestCardsPreview;