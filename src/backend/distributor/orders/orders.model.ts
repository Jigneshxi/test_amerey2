import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
  distributor_id: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  created_at: Date;
}

const orderSchema = new Schema<IOrder>({
  distributor_id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

export const Order = model<IOrder>('Order', orderSchema);