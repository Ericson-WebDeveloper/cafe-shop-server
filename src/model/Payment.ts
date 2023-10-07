import { Schema, model, now } from 'mongoose';
import { getDateTimeNow } from '../utility/dateUtility';

// Document interface
interface IPayment {
    order: Schema.Types.ObjectId,
    date_created: Date,
    payment_type: string,
    payment_created: Date,
    payment_status: boolean,
    payment_remarks: 'pending'|'cancel'|'success',
    payment_ref1: string,
    payment_ref2: string,
    payment_ref3: string,
    payment_ref4: string,
    total_payment: number
}

// Schema
const paymentSchema = new Schema<IPayment>({
    order: { type: Schema.Types.ObjectId, required: true, ref: 'Order'},
    payment_type: { type: String, required: true },
    date_created: {type: Date},
    payment_created: {type: Date},
    payment_status: {type: Schema.Types.Boolean, required: true, default: false},
    payment_remarks: {type: String, required: true, default: 'pending'},
    payment_ref1: {type: String},
    payment_ref2: {type: String},
    payment_ref3: {type: String},
    payment_ref4: {type: String},
    total_payment: {type: Number, required: true, default: 0.00},
});

export default model<IPayment>('Payment', paymentSchema);