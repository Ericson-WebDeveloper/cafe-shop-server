import { Schema, model, now } from 'mongoose';
import { getDateTimeNow } from '../utility/dateUtility';

// Document interface
interface IOrderDetail {
    order: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
    // selections: Array<string>,
    selections: Schema.Types.ObjectId[],
    price: number,
    total_price: number,
    total_qty: number
}

// Schema
const orderDetailSchema = new Schema<IOrderDetail>({
    order: { type: Schema.Types.ObjectId, required: true, ref: 'Order'},
    product: { type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    selections: [{ type: Schema.Types.ObjectId, required: true, ref: 'VariantSelection'}],
    price: {type: Number, required: true, default: 0.00},
    total_price: {type: Number, required: true, default: 0.00},
    total_qty: {type: Number, required: true}
});

export default model<IOrderDetail>('OrderDetail', orderDetailSchema);