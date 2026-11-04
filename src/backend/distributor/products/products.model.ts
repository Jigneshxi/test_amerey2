import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  distributor_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    validate: {
      validator: function(value) {
        // Basic input validation to prevent potential injection attacks.  More robust validation should be done in the service layer.
        if (typeof value !== 'string') return false;
        if (value.length === 0) return false;
        if (/[<>&"']/.test(value)) return false; // Check for potentially malicious characters
        return true;
      },
      message: 'Invalid product name.'
    }
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(value) {
        // Basic input validation for description.
        if (typeof value !== 'string') return false;
        return true;
      },
      message: 'Invalid product description.'
    }
  },
  distributor_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    validate: {
      validator: function(value) {
        //Basic distributor_id validation
        if (typeof value !== 'string') return false;
        if (value.length === 0) return false;
        return true;
      },
      message: 'Invalid distributor ID.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Add index for efficient searching.  Consider multi-field indexes for combined search criteria.
productSchema.index({ name: 'text', description: 'text' });

export default model<IProduct>('Product', productSchema);