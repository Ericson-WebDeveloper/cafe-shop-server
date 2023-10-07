import { Schema, model, now } from 'mongoose';

// Document interface
interface ICart {
    user: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
    selections: Schema.Types.ObjectId[],
    qty: number,
    price: number,
    total_price: number,
    date: Date
}

// Schema
const cartSchema = new Schema<ICart>({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    product: { type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    selections: [{ type: Schema.Types.ObjectId, ref: 'VariantSelection'}], //required: true,
    qty: {type: Number, required: true},
    price: {type: Number, required: true},
    total_price: {type: Number, required: true},
    date: {type: Date}
});

export default model<ICart>('Cart', cartSchema);