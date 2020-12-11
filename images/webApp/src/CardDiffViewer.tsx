import * as React from "react";
import * as Comp from "./computations"
import * as Utils from "./Utils"
import * as DataModel from "./DataModel"
import "./CardDiffViewer.scss"

function WarningMessage(props: { message: string }) {
    return <p className="attentionInfo">{props.message}</p>
}

function FeaturesVerticalBar(props: { features: number[] }) {
    const features = props.features;
    const count = features.length;
    const stripeLen = 4;
    const stripeWidth = 30;
    const stripes = features.map((v, idx) => {
        const offset = idx * stripeLen;
        const brightness = ((v + 1.0) / 2.0 * 255.0).toFixed()
        const stripeStyle = { "fill": "rgb(" + brightness + "," + brightness + "," + brightness + ")" } as React.CSSProperties;
        return <rect width={stripeWidth} height={stripeLen} x='0' y={offset} style={stripeStyle} />
    });
    return (
        <svg width={stripeWidth} height={count * stripeLen}>
            <title>"Штрихкод" питомца : то как система представляет признаки внешнего вида питомца. У одинаковых на вид питомцев будет одинаковый штрихкод.</title>
            {stripes}
        </svg>
    )
}

function FeaturesDiffVerticalBar(props: { features1: number[], features2: number[] }) {
    const features1 = props.features1;
    const features2 = props.features2;
    if(features1.length !== features2.length)
        return <p>features1.length != features2.length</p>;

    const count = features1.length;
    
    const stripeLen = 4;
    const stripeWidth = 20;
    const stripes = features1.map((v1,idx) => {
        const v2 = features2[idx]
        const vDiff = v1 - v2 // in range -2 .. 2
        const offset = idx * stripeLen;
        const coercedDiff = Math.max(-1,Math.min(1,vDiff))
        const brightness = ( (coercedDiff + 1.0) / 2.0 * 127.0 + 128).toFixed()
        const stripeStyle = { "fill": "rgb(" + brightness + "," + brightness + "," + brightness + ")" } as React.CSSProperties;
        return <rect width={stripeWidth} height={stripeLen} x='0' y={offset} style={stripeStyle} />
    });
    return (
        <svg width={stripeWidth} height={count * stripeLen}>
            <title>"Штрихкод" питомца - то, как система представляет признаки внешнего вида питомца. У одинаковых на вид питомцев будет одинаковый штрихкод.</title>
            {stripes}
        </svg>
    )
}



/// Presents the difference between two cards
function CardDiffViewer(props: { card1: DataModel.AnimalCard, card2: DataModel.AnimalCard }) {
    const card1 = props.card1;
    const card2 = props.card2;
    const geoDistKM = Comp.geodistance(
        card1.location.lat,
        card1.location.lon,
        card2.location.lat,
        card2.location.lon);
    const geoDistStr = Utils.getGeoDiffString(geoDistKM)

    const timeDiffMs = Math.abs(new Date(card1.eventTime).getTime() - new Date(card2.eventTime).getTime());
    const timeDiffStr = Utils.getTimeDiffString(timeDiffMs)
    
    function getSexWarning() {
        if
            ((card1.animalSex !== card2.animalSex) &&
            (card1.animalSex !== DataModel.Sex.Unknown) &&
            (card2.animalSex !== DataModel.Sex.Unknown))
            return <img src="./img/genderDiffers.svg" alt="Животные, предположительно, разного пола!" title="Животные, предположительно, разного пола!" className="cardDiffGenderIcon"/>
        else return false;
    }

    function getDifferentAnimalsWarning() {
        if (card1.animal !== card2.animal)
            return <WarningMessage message="Животные разного вида!" />
    }

    function getLostAfterFoundWarning() {
        if (card1.cardType !== card2.cardType) {
            const lostCard = card1.cardType === DataModel.CardType.Lost ? card1 : card2;
            const foundCard = card1.cardType === DataModel.CardType.Lost ? card2 : card1;
            if (lostCard.eventTime > foundCard.eventTime) {
                return <WarningMessage message="Время находки предшествует времени потери!" />
            }
        }
        return false;
    }

    function getFeaturesDifferences() {
        if (card1.animal === card2.animal) {
            const featuresName = "exp_3_4"
            const feat1 = card1.features[featuresName]
            const feat2 = card2.features[featuresName]
            if (feat1 && feat2) {
                const cosSim = Comp.cosSimilarity(feat1, feat2).toFixed(3)

                const flexDivStyle = {
                    'display': 'flex',
                    'flexDirection': 'row',
                    'justifyContent': 'space-around'
                } as React.CSSProperties;
                return (
                    <div style={flexDivStyle}>
                        <div>
                            <FeaturesVerticalBar features={feat1} />
                            <FeaturesDiffVerticalBar features1={feat1} features2={feat2} />
                            <FeaturesVerticalBar features={feat2} />
                              
                        </div>
                        <div>
                            <p>Схожесть</p>
                            <hr />
                            <p>{cosSim}</p>
                        </div>
                       

                    </div>
                )
            }
        }
        return false;
    }

    return (
        <div className="cardDiffViewer">
            <div className="cardDiffItems">
                <img className="cardDiffIcons" src="./img/distanceS.svg" alt="Расстояние" title="Расстояние"/>{geoDistStr}
            </div>
            <div className="cardDiffItems">
                <img className="cardDiffIcons" src="./img/distanceT.svg" alt="Между событиями прошло" title="Между событиями прошло"/>{timeDiffStr}
            </div>
            {/* {getFeaturesDifferences()} */}
            <div className="cardDiffWarnings">
                <div className="cardDiffItems">{getSexWarning()}</div>
                <div className="cardDiffItems">{getDifferentAnimalsWarning()}</div>
                <div className="cardDiffItems">{getLostAfterFoundWarning()}</div>
            </div>
        </div>
    )
}

export default CardDiffViewer;