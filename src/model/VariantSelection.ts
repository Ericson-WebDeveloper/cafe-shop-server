import { Schema, model } from "mongoose";

// Document interface
interface IVariantSelection {
  name: string,
  price: number,
  variant: Schema.Types.ObjectId,
  image?: string,
  status: boolean,
  default_select: boolean
}

// Schema
const variantSelectionSchema = new Schema<IVariantSelection>({
    name: { type: String, required: true, unique: true},
    price: { type: Number, required: true },
    variant: { type: Schema.Types.ObjectId, required: true, ref: "Variant" },
    image: { type: String },
    status: {type: Schema.Types.Boolean, required: true},
    default_select: {type: Schema.Types.Boolean, required: true}
});

export default model<IVariantSelection>("VariantSelection", variantSelectionSchema);