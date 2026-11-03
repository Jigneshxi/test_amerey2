const express = require('express');
const router = express.Router();
const { validateOrderData } = require('../utils/validation');
const { processPayment } = require('../modules/MOD-022');
const { updateInventory } = require('../modules/MOD-025');

// Rate limiting middleware (example - replace with a robust solution)
const rateLimit = require('express-rate-limit');
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Limit to 10 requests per minute
  message: 'Too many requests from this IP. Please try again after a minute.',
});

router.post('/orders', apiRateLimit, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    // Validate order data
    if (!validateOrderData(items, paymentMethod, shippingAddress)) {
      return res.status(400).json({ message: 'Invalid order details' });
    }

    // **Encrypt sensitive payment information** -  In a real application, use a secure encryption library.
    // For demonstration purposes, we'll just mask part of the payment method.
    const maskedPaymentMethod = paymentMethod.replace(/\d{4}(?=\d{4})/g, '****');

    // Process payment
    let transactionId;
    try {
      const paymentResult = await processPayment(items, maskedPaymentMethod);
      transactionId = paymentResult.transactionId;
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return res.status(500).json({ message: 'Payment processing error' });
    }
    
    // Update inventory
    try {
      await updateInventory(items);
    } catch (inventoryError) {
      console.error('Inventory update error:', inventoryError);
      return res.status(500).json({ message: 'Insufficient inventory' });
    }

    // Create order (In a real application, this would involve saving to a database)
    const orderId = generateOrderId(); // Implement order ID generation logic

    res.status(201).json({ orderId });

  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Failed to place order' });
  }
});

// Helper function to generate a unique order ID (replace with a more robust solution)
function generateOrderId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = router;