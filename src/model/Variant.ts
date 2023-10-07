import { Schema, model } from "mongoose";

// Document interface
interface IVariant {
  product: Schema.Types.ObjectId;
  name: string;
  status: boolean;
  default: boolean;
}

// Schema
const variantSchema = new Schema<IVariant>({
  product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
  name: {
    type: String,
    required: true,
    enum: [
      "size",
      "color",
      "flavor",
      "add on",
      "side dish",
      "drinks",
      "extra",
      "others",
    ]
  },
  status: { type: Schema.Types.Boolean, default: true },
  default: { type: Schema.Types.Boolean, required: true },
});

export default model<IVariant>("Variant", variantSchema);
