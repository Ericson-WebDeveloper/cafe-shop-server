import { IUserType } from "./UserType";
import { Types } from "mongoose"

export interface IUserDetailType {
    _id: string|Types.ObjectId
    user: string|IUserType
    avatar: string
    address: string
    token?: {
        code: string,
        date: Date
      }
}