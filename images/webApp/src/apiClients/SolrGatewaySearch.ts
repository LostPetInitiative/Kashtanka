import { EndOfFileToken } from "typescript";
import * as ISearch  from "./ISearch";

type FoundCard = {
    id: string,
    similarity: number
}

type EndOfStreamMarker = {
    EOF: boolean,
    RESPONSE_TIME: number
}

type SolrSuccessfulStream = {
    "result-set" : {
        "docs": (FoundCard | EndOfStreamMarker)[]
    }
}

function isEndOfTheStream(elem:FoundCard | EndOfStreamMarker): elem is EndOfStreamMarker {
    return (<EndOfStreamMarker>elem).EOF !== undefined;
}

type GatewayRequest = {
    Lat: number,
    Lon: number,
    Animal: ISearch.Animal,
    EventType: ISearch.EventType,
    EventTime: string,
    FeaturesIdent: string,
    Features: number[]
}

class SolrGatewaySearch implements ISearch.ISearch {
    private gatewayAddr: string;
    private matchedCardsSearchURL : string;

    constructor(gatewayAddr: string) {
        this.gatewayAddr = gatewayAddr;
        this.matchedCardsSearchURL = gatewayAddr +"/MatchedCardsSearch";
    }

    async GetRelevantCards(lat: number, lon: number, animal: ISearch.Animal, eventType: ISearch.EventType, EventTime: Date, featuresIdent: string, features: number[]): Promise<ISearch.SearchResult> {
        var gatewayRequest:GatewayRequest = {
            Lat: lat,
            Lon: lon,
            Animal: animal,
            EventType: eventType,
            EventTime: EventTime.toISOString(),
            FeaturesIdent: featuresIdent,
            Features: features
        }
        var fetchRes = await fetch(this.matchedCardsSearchURL, {
            method:"POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(gatewayRequest)})
        if(fetchRes.ok) {
            const parsed:SolrSuccessfulStream = await fetchRes.json()
            const result:ISearch.FoundCard[] = []
            var i = 0;
            const docs = parsed["result-set"].docs;
            while((i<docs.length)) {
                var current = docs[i]
                if(isEndOfTheStream(current)) {
                    break;
                } else {
                    const parts = current.id.split('/')
                    result.push({
                        namespace: parts[0],
                        id: parts[1],
                        similarity: current.similarity
                    });
                }
                i++;          
            }
            return result;
        } else {
            var errorMess = "Non successful error code "+fetchRes.status+" for fetching relevant cards: "+fetchRes.statusText;
            console.error(errorMess)
            return {ErrorMessage: errorMess}
        }
    }
}

export default SolrGatewaySearch;