import { Schema, model } from "mongoose";

// Document interface
interface IUserDetail {
  user: Schema.Types.ObjectId;
  avatar: string;
  address: string;
  token?: {
    code: string,
    date: Date
  }
}

// Schema
const userDetailSchema = new Schema<IUserDetail>({
  user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  avatar: { type: String, required: true },
  address: { type: String, required: true },
  token: {
    code: {type: String},
    date: {type: Date},
  }
});

export default model<IUserDetail>("UserDetail", userDetailSchema);
