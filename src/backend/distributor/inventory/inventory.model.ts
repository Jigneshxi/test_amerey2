import { Schema, model, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: string; // Reference to the product (MOD-023)
  quantityOnHand: number;
  lastUpdated: Date;
}

const inventorySchema = new Schema<IInventory>({
  productId: {
    type: String,
    required: true,
    ref: 'Product' // Assuming MOD-023 exports a 'Product' model
  },
  quantityOnHand: {
    type: Number,
    required: true,
    min: 0, // Prevent negative inventory
    default: 0
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Handle returns/refunds by increasing quantityOnHand
// Handle damaged/expired inventory (could add a 'status' field to Inventory if needed)

inventorySchema.method('increaseQuantity', function(amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be positive to increase quantity.');
  }
  this.quantityOnHand += amount;
  this.lastUpdated = Date.now();
  return this.save();
});

inventorySchema.method('decreaseQuantity', async function(amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be positive to decrease quantity.');
  }

  if (this.quantityOnHand < amount) {
    throw new Error('Not enough stock available.'); // Prevent over-selling
  }

  this.quantityOnHand -= amount;
  this.lastUpdated = Date.now();
  return this.save();
});


export const Inventory = model<IInventory>('Inventory', inventorySchema);