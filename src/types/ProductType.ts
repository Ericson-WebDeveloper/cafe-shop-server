import { Types } from "mongoose";
import { ICategoryType } from "./CategoryType";



export interface IProductType {
    _id: string,
    name: string,
    image: string,
    categories: string[] | Types.ObjectId[] | ICategoryType[],
    description: string,
    status: boolean,
    default_price: number
}