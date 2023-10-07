import { Schema, model } from 'mongoose';

// Document interface
interface IUser {
  name: string;
  email: string;
  password: string,
  status: boolean,
  is_admin: boolean
}

// Schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  status: { type: Schema.Types.Boolean, required: true, default: true },
  is_admin: { type: Schema.Types.Boolean, required: true, default: false }
});

export default model<IUser>('User', userSchema);