import { Schema, model, Types} from "mongoose";

// Document interface
interface IProduct {
  name: string;
  image: string;
  categories: Types.ObjectId[];
  description: string;
  status: boolean;
  default_price: number;
}

// Schema
const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  categories: [
    { type: Schema.Types.ObjectId, required: true, ref: "Category" },
  ],
  description: { type: String, required: true },
  status: { type: Schema.Types.Boolean, required: true },
  default_price: { type: Schema.Types.Number, required: true, default: 0.0 },
});

export default model<IProduct>("Product", productSchema);
