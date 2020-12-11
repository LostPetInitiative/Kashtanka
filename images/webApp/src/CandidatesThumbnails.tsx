import * as React from "react";
import "./AnimalCard.scss"
import * as ICardStorage from "./apiClients/ICardStorage"
import * as DataModel from "./DataModel";
import * as Comp from "./computations"
import * as Utils from "./Utils"
import * as ISearch from "./apiClients/ISearch"
import "./CandidatesThumbnails.scss"

export function AnimalCardThumbnail(props: {
    card: DataModel.AnimalCard,
    isAccent: boolean,
    refCard: DataModel.AnimalCard | null
}) {
    const card = props.card;

    var geoString;
    if (props.refCard !== null) {
        const card1 = props.card.location
        const card2 = props.refCard.location
        const geoDist = Comp.geodistance(card1.lat, card1.lon, card2.lat, card2.lon)
        geoString = Utils.getGeoDiffString(geoDist)
    } else
        geoString = props.card.location.address

    var timeString
    if (props.refCard !== null) {
        const date1 = props.card.eventTime
        const date2 = props.refCard.eventTime
        timeString = Utils.getTimeDiffString(Math.abs(date1.getTime() - date2.getTime()))
    } else {
        const now = new Date()
        const diffMs = (now.getTime() - props.card.cardCreationTime.getTime())
        timeString = Utils.getTimeDiffString(diffMs)+" назад"
    }

    const thumbnailContainerClassName = "thumbnail-container" + (props.isAccent ? " accent" : "")
    return (
        <div className={thumbnailContainerClassName}>
            <div className="overlay-info-anchor">
                <div className="overlay-info">
                    <p className="overlay-text">{timeString}</p>
                    <p className="overlay-text">{geoString}</p>
                </div>
            </div>
            { card.photos.length > 0 &&
                <img src={card.photos[0].srcUrl} alt="Фото"/>
            }
            { card.photos.length === 0 &&
                <p>Нет фото</p>
            }
        </div>
    );
}

type AnimalCardThumbnailByIdProps = {
    cardStorage: ICardStorage.ICardStorage,
    refCard: DataModel.AnimalCard | null,
    isAccented: boolean,
    namespace: string,
    localID: string
}

type AnimalCardThumbnailByIdState = {
    loadedFullID: string,
    loadedCard: DataModel.AnimalCard | "Loading" | "Unexistent" | "NotSet"
}

export class AnimalCardThumbnailById
    extends React.Component<AnimalCardThumbnailByIdProps, AnimalCardThumbnailByIdState> {
    constructor(props: AnimalCardThumbnailByIdProps) {
        super(props)
        this.state = {
            loadedFullID: "",
            loadedCard: "Loading"
        }
    }

    checkLoadedCard() {
        const neededFullID = this.props.namespace + "/" + this.props.localID;
        if (this.state.loadedFullID !== neededFullID) {
            // resetting and initiating background load
            this.setState({
                loadedFullID: neededFullID,
                loadedCard: (neededFullID==="")?"NotSet":"Loading" })
            this.props.cardStorage.GetPetCard(this.props.namespace, this.props.localID).then(result => {
                if(ICardStorage.isUnexistentCardToken(result)) {
                    this.setState({ loadedCard: "Unexistent" })
                } else {
                    const card = result
                    this.setState({ loadedCard: card })
                }
            });
        }
    }

    componentDidMount() { this.checkLoadedCard() }
    componentDidUpdate() { this.checkLoadedCard() }

    render() {
        switch(this.state.loadedCard) {
            case "Loading":
                return <p>Загрузка...</p>
            case "NotSet":
                return <p>Не задано.</p>
            case "Unexistent":
                return <p>Карточка не найдена.</p>
            default:
                return <AnimalCardThumbnail card={this.state.loadedCard} refCard={this.props.refCard} isAccent={this.props.isAccented} />
        }
    }
}


type CandidatesThumbnailsStateType = {
    shownReferenceCardId: string,
    loadedRelevantCards: ISearch.SimilarSearchResult | null,
    currentSelectionIdx: number
}

type CandidatesThumbnailsPropsType = {
    referenceCard: DataModel.AnimalCard | null
    selectedCardFullID: string,
    selectionChanged: (newSelectionFullID: string) => void,
    searcher: ISearch.ISearch,
    cardStorage: ICardStorage.ICardStorage
}

function capitalize(str: string): string {
    if (str.length === 0)
        return str
    else {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
}

function marshalAnimal(animal: DataModel.Animal): ISearch.Animal {
    return capitalize(animal as string) as ISearch.Animal;
}

function marshalEventType(t: DataModel.CardType): ISearch.EventType {
    return capitalize(t as string) as ISearch.EventType;
}

export class CandidatesThumbnails
    extends React.Component<CandidatesThumbnailsPropsType, CandidatesThumbnailsStateType> {
    constructor(props: CandidatesThumbnailsPropsType) {
        super(props)

        this.state = {
            shownReferenceCardId: "",
            currentSelectionIdx: 0,
            loadedRelevantCards: null
        }
    }

    checkLoadedData() {
        // checking the state of loaded card and the current needed card IDs
        const requestedFullID = (this.props.referenceCard == null) ? "" : (this.props.referenceCard.namespace + "/" + this.props.referenceCard.id);

        if (this.state.shownReferenceCardId !== requestedFullID) {
            // we need to initiate the background (re)load of candidates

            // resetting previously downloaded data
            this.setState({
                shownReferenceCardId: requestedFullID,
                loadedRelevantCards: null,
                currentSelectionIdx: 0
            })

            if (this.props.referenceCard !== null) {
                // initiating background load
                console.log("Initiating download of relevant cards for " + requestedFullID)

                const card = this.props.referenceCard
                const featuresIdent = Object.keys(card.features)[0]
                this.props.searcher.GetRelevantCards(card.location.lat, card.location.lon,
                    marshalAnimal(card.animal),
                    marshalEventType(card.cardType),
                    card.eventTime,
                    featuresIdent,
                    card.features[featuresIdent]).then(relevantSearchRes => {
                        if (ISearch.IsSimilarResultSuccessful(relevantSearchRes)) {
                            console.log("Got relevant cards for " + requestedFullID)
                            const relevantCards = relevantSearchRes as ISearch.FoundSimilarCard[]
                            this.setState({ loadedRelevantCards: relevantCards })

                            // trying to set proper selected relevant card by looking for the desired card
                            if (this.props.selectedCardFullID !== null) {
                                const foundIdx = relevantCards.findIndex(v => v.namespace + "/" + v.id === this.props.selectedCardFullID)
                                if (foundIdx !== -1) {
                                    //const doNotifyNewSelection = foundIdx !== this.state.currentSelectionIdx
                                    this.setState({currentSelectionIdx : foundIdx})
                                } else {
                                    this.setState({currentSelectionIdx : NaN})
                                }
                            }
                        } else {
                            console.error("Failed to get relevant cards: " + relevantSearchRes.ErrorMessage)
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

    handleThumbnailSelection(fullID: string, e: (React.MouseEvent | null)) {
        if (this.props.selectionChanged !== null) {
            this.props.selectionChanged(fullID)
        }
        if (this.state.loadedRelevantCards !== null) {
            if (ISearch.IsSimilarResultSuccessful(this.state.loadedRelevantCards)) {
                const foundIdx = this.state.loadedRelevantCards.findIndex(card => (card.namespace + "/" + card.id) === fullID)
                if (foundIdx !== -1) {
                    this.setState({ currentSelectionIdx: foundIdx })
                }
            }
        }
    }

    getRelevantCards(refCard: DataModel.AnimalCard | null) {
        const that = this;
        const genPreview = ([foundCard, isAccent]: [ISearch.FoundSimilarCard, boolean]) => {
            const arrayKey = foundCard.namespace + "/" + foundCard.id
            return (
                <div onClick={(e) => this.handleThumbnailSelection(arrayKey, e)} key={arrayKey}>
                    <AnimalCardThumbnailById
                        key={arrayKey}
                        refCard={refCard}
                        isAccented={isAccent}
                        cardStorage={that.props.cardStorage}
                        namespace={foundCard.namespace}
                        localID={foundCard.id} />
                </div>)
        }

        if (this.state.loadedRelevantCards === null) {
            return <p>Загрузка совпадений...</p>;
        } else {
            if (ISearch.IsSimilarResultSuccessful(this.state.loadedRelevantCards)) {
                const selectedIdx = this.state.currentSelectionIdx % this.state.loadedRelevantCards.length
                var previews = this.state.loadedRelevantCards.map((card, idx) => [card, (idx === selectedIdx)] as [ISearch.FoundSimilarCard, boolean]).map(genPreview)
                if (previews.length === 0)
                    previews = [<p>Нет совпадений =(</p>]
                return <div className="thumbnails-container">{previews}</div>
            }
        }
    }

    wheel(e:React.WheelEvent<HTMLDivElement>) {
        const delta = Math.max(-1, Math.min(1, (e.deltaX || e.deltaY)))
        e.currentTarget.scrollLeft += (delta * 50)
        e.preventDefault()
    }

    render() {
        if (this.props.referenceCard !== null) {
            const releavantCards = this.getRelevantCards(this.props.referenceCard);
            return (
                <div className="page" onWheel={e => this.wheel(e)}>
                    <div className="title-container">
                        <p>Возможные совпадения:</p>
                    </div>
                    {releavantCards}
                </div>
            )
        } else {
            return <p>Загрузка...</p>
        }
    }
}
