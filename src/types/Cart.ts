import { Types } from "mongoose"
import { IProductType } from "./ProductType"
import { IVariantSelectType } from "./VariantSelectionType"
import { IUserType } from "./UserType"


export interface ICartType {
    _id: string | Types.ObjectId,
    user: string | Types.ObjectId | IUserType,
    product: string | Types.ObjectId | IProductType,
    selections: Types.ObjectId[] | IVariantSelectType[],
    qty: number,
    price: number,
    total_price: number,
    date: Date
}