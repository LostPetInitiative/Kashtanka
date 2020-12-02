import * as React from "react";
import * as DataModel from "./DataModel"
import ICardStorage from "./apiClients/ICardStorage"
import * as ISearch from "./apiClients/ISearch"
import AnimalCard from "./AnimalCard"
import * as Thumbnails from "./AnimalCardThumbnail"

type PropsType = {
    cardStorage: ICardStorage,
    searcher: ISearch.ISearch,
    ns: string,
    localID: string
}
type StateType = {
    loadedCard: DataModel.AnimalCard | null,
    loadedRelevantCards: ISearch.SearchResult | null,
    loadedFullID: string,
    currentSelectionIdx: number
}

function capitalize(str: string) : string {
    if (str.length === 0)
        return str
    else {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
}

function marshalAnimal(animal : DataModel.Animal) : ISearch.Animal {
    return capitalize(animal as string) as ISearch.Animal;
}

function marshalEventType(t : DataModel.CardType) : ISearch.EventType {
    return capitalize(t as string) as ISearch.EventType;
}

class CandidatesThumbnails extends React.Component<PropsType, StateType> {
    constructor(props:PropsType) {
        super(props)

        this.state = {
            loadedFullID: "",
            currentSelectionIdx: 0,
            loadedCard: null,
            loadedRelevantCards: null
        }
    }

    checkLoadedData() {
        // checking the state of loaded card and the current needed card IDs
        const requestedFullID = this.props.ns+"/"+this.props.localID;
        if(this.state.loadedFullID !== requestedFullID) {
            // we need to initiate the background load
            
            // resetting previously downloaded data
            this.setState({
                loadedFullID: requestedFullID,
                loadedCard : null,
                loadedRelevantCards: null,
                currentSelectionIdx: 0})

            // initiating background load
            console.log("Initiating download of card "+requestedFullID)
            this.props.cardStorage.GetPetCard(this.props.ns, this.props.localID).then(card => {
                this.setState({ loadedCard: card})
                console.log("Got card for "+requestedFullID)

                // now initiating
                console.log("Initiating download of relevant cards for "+requestedFullID)
                const featuresIdent = Object.keys(card.features)[0]
                this.props.searcher.GetRelevantCards(card.location.lat, card.location.lon,
                    marshalAnimal(card.animal),
                    marshalEventType(card.cardType),
                    new Date(card.eventTime),
                    featuresIdent,
                    card.features[featuresIdent]).then(relevantSearchRes => {
                        console.log("Got relevant cards for "+requestedFullID)
                        if(ISearch.IsResultSuccessful(relevantSearchRes)) {
                            const relevantCards = relevantSearchRes as ISearch.FoundCard[]
                            this.setState({loadedRelevantCards: relevantCards})
                        } else {
                            console.error("Failed to get relevant cards: "+relevantSearchRes.ErrorMessage)
                        }
                    });
            })
        }
    }

    componentDidMount() {
        this.checkLoadedData()
    }

    componentDidUpdate() {
        this.checkLoadedData()
    }

    getActiveCardViewer() {
        if (this.state.loadedCard === null) {
            return <p>Загрузка карточки...</p>;
        } else {
            return <AnimalCard card={this.state.loadedCard} />
        }
    }

    getRelevantCards() {
        const that = this;
        const genPreview = (foundCard:ISearch.FoundCard) => {
            const arrayKey = foundCard.namespace+"/"+foundCard.id
            return (
                <Thumbnails.AnimalCardThumbnailById
                    key={arrayKey}
                    cardStorage={that.props.cardStorage}
                    namespace={foundCard.namespace}
                    localID={foundCard.id}/>)
        }

        if (this.state.loadedRelevantCards === null) {
            return <p>Загрузка совпадений...</p>;
        } else {
            const thumbnailsContainerStyle =
            {'display':'flex',
             'flex-wrap':'wrap'
            } as React.CSSProperties;
            if(ISearch.IsResultSuccessful(this.state.loadedRelevantCards)) {
                const previews = this.state.loadedRelevantCards.map(genPreview)
                return <div style={thumbnailsContainerStyle}>{previews}</div>
            }
        }
    }

    render() {
        const targetCard = this.getActiveCardViewer()
        const releavantCards = this.getRelevantCards();
        return (
                <div>
                    <h3>Образец</h3>
                    {targetCard}
                    <p>Возможные совпадения</p>
                    {releavantCards}
                </div>
                )
    }
}

export default CandidatesThumbnails;