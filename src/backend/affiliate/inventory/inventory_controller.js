const inventoryService = require('./inventory_service');

async function getInventory(req, res) {
  try {
    const productId = req.params.productId;

    // Input validation: Sanitize productId to prevent injection attacks
    if (!isValidProductId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const inventory = await inventoryService.getInventory(productId);

    if (!inventory) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const isLowStock = inventory.quantity < inventory.lowStockThreshold;
    const responseBody = {
      quantity: inventory.quantity,
      productId: inventory.productId,
      lowStockThreshold: inventory.lowStockThreshold
    };

    if (isLowStock) {
      responseBody.lowStockAlert = "Warning: Product is running low!";
    }

    res.status(200).json(responseBody);

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Simple validation function to check productId format.  Expand as needed.
function isValidProductId(productId) {
  // Check if productId is a string and contains only alphanumeric characters
  return typeof productId === 'string' && /^[a-zA-Z0-9]+$/.test(productId);
}

module.exports = {
  getInventory
};