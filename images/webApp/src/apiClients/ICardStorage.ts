import * as DataModel from '../DataModel'

export type UnexistentCardToken = {
    UnexistentCardNamespace: string,
    UnexistentCardID: string
}

export type GetPetCardReplyType = DataModel.AnimalCard | UnexistentCardToken

export interface ICardStorage {
    GetPetCard(namespace:string, localID:string) : Promise<GetPetCardReplyType>;
    GetPetCardByFullID(fullID: string) : Promise<GetPetCardReplyType>;
}

export function isUnexistentCardToken(reply: GetPetCardReplyType): reply is UnexistentCardToken {
    return ((reply as UnexistentCardToken).UnexistentCardID) !== undefined
}