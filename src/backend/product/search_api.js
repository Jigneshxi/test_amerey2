const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Mock database (replace with actual database connection)
const products = [
  { id: '1', name: 'Laptop', price: 1200 },
  { id: '2', name: 'Keyboard', price: 75 },
  { id: '3', name: 'Mouse', price: 25 },
  { id: '4', name: 'Monitor', price: 300 },
  { id: '5', name: 'Headphones', price: 100 },
  { id: '6', name: 'Webcam', price: 50 }
];

// Rate limiting middleware
const apiLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // Limit to 100 requests per minute
  message: 'Too many requests from this IP. Please try again after a minute.'
});

// Apply rate limiting to the /products/search endpoint
router.get('/search', apiLimit, (req, res) => {
  const { query, filters } = req.query;

  // Input validation to prevent SQL injection
  if (query && typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query parameter. Must be a string.' });
  }

  if (filters && typeof filters !== 'string') {
    return res.status(400).json({ error: 'Invalid filters parameter. Must be a string (JSON object).' });
  }

  let filteredProducts = products;

  try {
    if (filters) {
      const parsedFilters = JSON.parse(filters);

      // Validate filters (example: price range)
      if (parsedFilters.minPrice !== undefined && typeof parsedFilters.minPrice !== 'number') {
        return res.status(400).json({ error: 'Invalid minPrice filter. Must be a number.' });
      }
      if (parsedFilters.maxPrice !== undefined && typeof parsedFilters.maxPrice !== 'number') {
        return res.status(400).json({ error: 'Invalid maxPrice filter. Must be a number.' });
      }
        
      filteredProducts = products.filter(product => {
        let matchesFilters = true;
        if(parsedFilters.minPrice !== undefined){
            if(product.price < parsedFilters.minPrice){
                matchesFilters = false;
            }
        }
        if(parsedFilters.maxPrice !== undefined){
            if(product.price > parsedFilters.maxPrice){
                matchesFilters = false;
            }
        }
        return matchesFilters;
      });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid filters format. Must be a valid JSON object.' });
  }

  if (query) {
    const escapedQuery = query.replace(/[^a-zA-Z0-9]/g, ''); // Basic sanitization
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(escapedQuery.toLowerCase())
    );
  }

  if (filteredProducts.length === 0) {
    return res.status(200).json([]); // Return an empty array if no results are found
  }

  res.status(200).json(filteredProducts);
});

module.exports = router;