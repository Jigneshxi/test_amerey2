const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for content (replace with a database in production)
const contentStore = {};

// Middleware for authorization (replace with a proper authentication system)
const authorize = (req, res, next) => {
  // In a real application, you'd verify the user's identity and permissions here.
  // For this example, we'll just allow any request.
  next();
};

// POST /content - Create new content
router.post('/content', authorize, (req, res) => {
  try {
    const { content, product_id } = req.body;

    // Input validation to prevent injection attacks
    if (typeof content !== 'string' || content.length === 0) {
      return res.status(400).json({ error: 'Content must be a non-empty string.' });
    }
    if (typeof product_id !== 'string' || product_id.length === 0) {
      return res.status(400).json({ error: 'Product ID must be a non-empty string.' });
    }

    // Handle large content files (e.g., limit size, stream data)
    if (content.length > 100000) { // Limit content size to 100KB
      return res.status(413).json({ error: 'Content is too large.' });
    }
    
    const id = uuidv4();
    contentStore[id] = {
      id,
      content,
      product_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({});
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to save content.' });
  }
});

module.exports = router;