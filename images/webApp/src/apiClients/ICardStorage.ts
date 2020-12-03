import * as DataModel from '../DataModel'

interface ICardStorage {
    GetPetCard(namespace:string, localID:string) : Promise<DataModel.AnimalCard>;
    GetPetCardByFullID(fullID: string) : Promise<DataModel.AnimalCard>;
}

export default ICardStorage