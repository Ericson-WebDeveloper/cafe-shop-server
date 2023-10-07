import { Schema, Types } from "mongoose"
import { IUserDetailType } from "./UserDetailType"


export interface IUserType {
    _id: Types.ObjectId | string
    name: string
    email: string
    password?: string
    status: boolean
    is_admin: boolean
    details?: IUserDetailType
}