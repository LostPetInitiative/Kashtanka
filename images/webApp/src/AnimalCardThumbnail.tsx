import * as React from "react";
import "./AnimalCard.css"
import ICardStorage from "./apiClients/ICardStorage"
import * as DataModel from  "./DataModel";

export function AnimalCardThumbnail(props : {card: DataModel.AnimalCard}) {
    const card = props.card;

    var cardStyle = {"maxWidth":"400px"} as React.CSSProperties;

    return (
        <div style={cardStyle} className="animalCardThumbnail">
            <div>{new Date(card.eventTime).toDateString()}</div>
            <div className="cardCoordsNumbers">{card.location.address}</div>
            <br/>
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
            return <AnimalCardThumbnail card={this.state.loadedCard} />
        } else {
            return <p>Загрузка</p>
        }
    }
}