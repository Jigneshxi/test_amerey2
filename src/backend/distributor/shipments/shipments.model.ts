import { Schema, model, Document } from 'mongoose';

export interface IShipment extends Document {
  orderId: string;
  trackingNumber: string;
  status: string;
}

const shipmentSchema = new Schema<IShipment>({
  orderId: {
    type: String,
    required: true,
    unique: false,
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    // Encrypt tracking number at rest.  Consider using a library like `mongoose-encryption`.
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'shipped', 'in_transit', 'delivered', 'exception', 'cancelled'], // Added 'exception' and 'cancelled'
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Consider adding indexing for performance, e.g., orderId
shipmentSchema.index({ orderId: 1 });

export const Shipment = model<IShipment>('Shipment', shipmentSchema);