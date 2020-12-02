import * as React from "react";
import "./AnimalCard.css"
import ICardStorage from "./apiClients/ICardStorage"
import * as DataModel from  "./DataModel";
import * as Comp from "./computations"
import * as Utils from "./Utils"
import "./AnimalCardThumbnail.css"

export function AnimalCardThumbnail(props : {
    card: DataModel.AnimalCard,
    refCard: DataModel.AnimalCard | null}) {
    const card = props.card;

    var geoString;
    if(props.refCard !== null) {
        const card1 = props.card.location
        const card2 = props.refCard.location
        const geoDist = Comp.geodistance(card1.lat, card1.lon, card2.lat, card2.lon)
        geoString = Utils.getGeoDiffString(geoDist)
    } else
        geoString = props.card.location.address

    var timeString
    if(props.refCard !== null) {
        const date1 = new Date(props.card.eventTime)
        const date2 = new Date(props.refCard.eventTime)
        timeString = Utils.getTimeDiffString(Math.abs(date1.getTime() - date2.getTime()))
    } else
        timeString = new Date(props.card.eventTime).toLocaleString()

    var simString = ""
    if(props.refCard !== null) {
        const featuresIdents1 = Object.keys(props.card.features)
        const featuresIdents2 = Object.keys(props.card.features)
        
        const featuresIdentsIntersection = featuresIdents1.filter(value => featuresIdents2.includes(value))
        if(featuresIdentsIntersection.length > 0) {
            const featuresIdent = featuresIdentsIntersection[0]
            const feat1 = props.card.features[featuresIdent]
            const feat2 = props.refCard.features[featuresIdent]
            const cosSim = Comp.cosSimilarity(feat1, feat2)
            simString = cosSim.toFixed(3)
        }
    } 
        

    return (
        <div className="thumbnail-container">                        
            <div className="overlay-info-anchor">
            <div className="overlay-info">
                <p className="overlay-text-bold">{simString}</p>
                <p className="overlay-text">{timeString}</p>
                <p className="overlay-text">{geoString}</p>
            </div>
            </div>
            { card.photos.length>0 &&
                <img src={card.photos[0].srcUrl} />
            }
            { card.photos.length === 0 &&
                <p>Нет фото</p>
            }            
        </div>
    );
  }

type AnimalCardThumbnailByIdProps = {
    cardStorage: ICardStorage,
    refCard: DataModel.AnimalCard | null,
    namespace: string,
    localID: string
}

type AnimalCardThumbnailByIdState = {
    loadedFullID: string,
    loadedCard: DataModel.AnimalCard | null
}

export class AnimalCardThumbnailById
    extends React.Component<AnimalCardThumbnailByIdProps,AnimalCardThumbnailByIdState> {
    constructor(props:AnimalCardThumbnailByIdProps) {
        super(props)
        this.state = {
            loadedFullID: "",
            loadedCard: null
        }
    }

    checkLoadedCard() {
        const neededFullID = this.props.namespace+"/"+this.props.localID;
        if(this.state.loadedFullID != neededFullID) {
            // resetting and initiating background load
            this.setState({loadedFullID : neededFullID, loadedCard:null})
            this.props.cardStorage.GetPetCard(this.props.namespace,this.props.localID).then(card => {
                this.setState({loadedCard:card})
            });
        }
    }

    componentDidMount() { this.checkLoadedCard()}
    componentDidUpdate() {this.checkLoadedCard()}

    render() {
        if(this.state.loadedCard != null) {
            return <AnimalCardThumbnail card={this.state.loadedCard} refCard={this.props.refCard} />
        } else {
            return <p>Загрузка</p>
        }
    }
}