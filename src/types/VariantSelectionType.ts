import { Types } from "mongoose"



export interface IVariantSelectType {
    _id: string|Types.ObjectId
    variant: Types.ObjectId | string,
    name: string,
    price: number,
    image?: string,
    status: boolean,
    default_select: boolean
}