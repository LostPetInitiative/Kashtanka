import * as React from "react";
import * as Comp from "./computations"
import * as DataModel from "./DataModel"
import "./CardDiffViewer.css"

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

/// Presents the difference between two cards
function CardDiffViewer(props: { card1: DataModel.AnimalCard, card2: DataModel.AnimalCard }) {
    const card1 = props.card1;
    const card2 = props.card2;
    const geoDistKM = Comp.geodistance(
        card1.location.lat,
        card1.location.lon,
        card2.location.lat,
        card2.location.lon);
    const geoDistStr = (geoDistKM < 1.0) ?
        ((geoDistKM * 1000.0).toFixed(0) + " метров")
        : (geoDistKM.toFixed(0) + " км")

    const timeDiffMs = Math.abs(new Date(card1.eventTime).getTime() - new Date(card2.eventTime).getTime());

    var timeDiffStr: string;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;
    const oneYear = 12 * oneMonth;
    if (timeDiffMs > oneYear) {
        timeDiffStr = (timeDiffMs / oneYear).toFixed(1) + " лет"
    } else if (timeDiffMs > oneMonth) {
        timeDiffStr = (timeDiffMs / oneMonth).toFixed() + " месяцев"
    } else {
        timeDiffStr = (timeDiffMs / oneDay).toFixed() + " дней"
    }

    function getSexWarning() {
        if
            ((card1.animalSex != card2.animalSex) &&
            (card1.animalSex != DataModel.Sex.Unknown) &&
            (card2.animalSex != DataModel.Sex.Unknown))
            return <WarningMessage message="Животные, предположительно, разного пола!" />
        else return false;
    }

    function getDifferentAnimalsWarning() {
        if (card1.animal != card2.animal)
            return <WarningMessage message="Животные разного вида!" />
    }

    function getLostAfterFoundWarning() {
        if (card1.cardType != card2.cardType) {
            const lostCard = card1.cardType === DataModel.CardType.Lost ? card1 : card2;
            const foundCard = card1.cardType === DataModel.CardType.Lost ? card2 : card1;
            if (lostCard.eventTime > foundCard.eventTime) {
                return <WarningMessage message="Объявление о потере размещено после объявления о находке!" />
            }
        }
        return false;
    }

    function getFeaturesDifferences() {
        if (card1.animal == card2.animal) {
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
                            ---
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
        <div>
            <table>
                <tr>
                    <td>Расстояние</td><td> ≈ {geoDistStr}</td>
                </tr>
                <tr>
                    <td>Между событиями прошло</td><td> ≈ {timeDiffStr}</td>
                </tr>
            </table>
            {getFeaturesDifferences()}

            {getSexWarning()}
            {getDifferentAnimalsWarning()}
            {getLostAfterFoundWarning()}
        </div>
    )
}

export default CardDiffViewer;