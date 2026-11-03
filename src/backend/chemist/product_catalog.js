const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('./db'); // Assuming db.js handles database connection

// In-memory product store (replace with database interaction)
let products = [];

// Middleware to prevent SQL injection
const sanitizeInput = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      // Simple sanitization - replace with more robust solution for production
      req.body[key] = req.body[key].replace(/[;'"<>]/g, '');
    }
  }
  next();
};

// Middleware to check affiliate access
const checkAffiliateAccess = async (req, res, next) => {
  const { chemist_id } = req.body; // Assuming chemist_id is in the request body

  if (!chemist_id) {
    return res.status(401).json({ message: 'Chemist ID is required' });
  }

  // In a real application, you would verify the chemist_id against a user session or token.
  // For now, we just assume it's valid.

  next();
};

// API endpoint to add a new product
router.post('/products', sanitizeInput, checkAffiliateAccess, async (req, res) => {
  try {
    const { name, price, chemist_id, description } = req.body;

    if (!name || typeof price !== 'number' || !chemist_id || !description) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const product_id = uuidv4();

    const newProduct = {
      product_id,
      name,
      price,
      chemist_id,
      description
    };

    // Save to database
    try {
        await db.query('INSERT INTO products (product_id, name, description, price, chemist_id) VALUES ($1, $2, $3, $4, $5)',
        [product_id, name, description, price, chemist_id]);
    } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ message: 'Failed to save product to database' });
    }

    res.status(201).json({ product_id });

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

// API endpoint to update an existing product
router.put('/products/:product_id', sanitizeInput, checkAffiliateAccess, async (req, res) => {
  try {
    const { product_id } = req.params;
    const { name, price, description } = req.body;

    if (!name || typeof price !== 'number' || !description) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Check if product exists in the database
    const result = await db.query('SELECT * FROM products WHERE product_id = $1', [product_id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product in database
    await db.query('UPDATE products SET name = $1, description = $2, price = $3 WHERE product_id = $4',
    [name, description, price, product_id]);
    

    res.status(200).json({ message: 'Product updated' });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

module.exports = router;