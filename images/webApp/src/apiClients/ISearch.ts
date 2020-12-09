export type FoundCard = {
    namespace: string,
    id: string
}

export type FoundSimilarCard = {
    namespace: string,
    id: string,
    similarity: number
}

export type SearchError = {
    ErrorMessage : string
}

export type SimilarSearchResult = FoundSimilarCard[] | SearchError;

export function IsSimilarResultSuccessful(searchResult: SimilarSearchResult): searchResult is FoundSimilarCard[] {
    return Array.isArray(searchResult)
}

export enum EventType { Found = "Found", Lost = "Lost" }
export enum Animal { Cat = "Cat", Dog = "Dog" }

export enum LatestCardSearchType { Lost, Found, Unspecified }

export interface ISearch {
    GetRelevantCards(lat:number, lon:number, animal: Animal, eventType:EventType,
        EventTime: Date, featuresIdent: string, features: number[] ) : Promise<SimilarSearchResult>;

    GetLatestCards(maxCardNumber: number, cardType: LatestCardSearchType): Promise<FoundCard[]>
}