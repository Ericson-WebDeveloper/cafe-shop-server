import { Types } from "mongoose";
import { IVariantSelectType } from "./VariantSelectionType";
import { IOrderType } from "./Order";
import { IProductType } from "./ProductType";




export interface IOrderDetailsType {
    _id: Types.ObjectId,
    order: Types.ObjectId | IOrderType,
    product: Types.ObjectId | IProductType,
    selections: Types.ObjectId[] | IVariantSelectType[],
    price: number,
    total_price: number,
    total_qty: number
}