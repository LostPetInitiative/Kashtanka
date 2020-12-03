export type FoundCard = {
    namespace: string,
    id: string,
    similarity: number
}

export type SearchError = {
    ErrorMessage : string
}

export type SearchResult = FoundCard[] | SearchError;

export function IsResultSuccessful(searchResult: SearchResult): searchResult is FoundCard[] {
    return Array.isArray(searchResult)
}

export enum EventType { Found = "Found", Lost = "Lost" }
export enum Animal { Cat = "Cat", Dog = "Dog" }

export interface ISearch {
    GetRelevantCards(lat:number, lon:number, animal: Animal, eventType:EventType,
        EventTime: Date, featuresIdent: string, features: number[] ) : Promise<SearchResult>;
}