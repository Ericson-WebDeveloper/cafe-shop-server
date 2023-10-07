import { Schema, model } from 'mongoose';

// Document interface
interface ICategory {
  name: string;
}

// Schema
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true }
});

export default model<ICategory>('Category', categorySchema);