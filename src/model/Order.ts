import { Schema, model, now } from 'mongoose';
import { getDateTimeNow } from '../utility/dateUtility';

// Document interface
interface IOrder {
    user: Schema.Types.ObjectId,
    details: {
        house_no: number,
        city: string,
        province: string,
        zip_code: number
    },
    carts?: string[],

    delivery_remark?: 'Cancel'|'Delivered'|'Preparing'|'On the Way'|'New',
    
    // selections: Array<string>
    date_created: Date,
    delivery_status: boolean,
    payment_status: boolean,
    // payment_remarks: 'pending'|'cancel'|'success',
    // payment_ref1: string,
    // payment_ref2: string,
    total_price: number,
    total_qty: number
}

// Schema
const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    details: {
        house_no: { type: Number, required: true},
        city: { type: String, required: true},
        province: { type: String, required: true},
        zip_code: { type: Number, required: true}
    },

    delivery_remark: { type: String, enum: ['Cancel','Delivered','Preparing','On the Way','New']},

    carts: [{type: String}],
    // selections: [{ type: String, required: true, default: 'default'}],
    date_created: {type: Date, default: getDateTimeNow()},
    delivery_status: {type: Schema.Types.Boolean, required: true, default: false},
    payment_status: {type: Schema.Types.Boolean, required: true, default: false},
    // payment_remarks: {type: String, required: true, default: 'pending'},
    // payment_ref1: {type: String},
    // payment_ref2: {type: String},
    total_price: {type: Number, required: true, default: 0.00},
    total_qty: {type: Number, required: true}
});

export default model<IOrder>('Order', orderSchema);