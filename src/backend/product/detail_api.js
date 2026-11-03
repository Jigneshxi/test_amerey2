const express = require('express');
const router = express.Router();
const { getProductById } = require('../../../MOD-022/db'); // Assuming MOD-022 provides db access
const { cache } = require('../../../MOD-022/cache'); // Assuming MOD-022 provides caching

// In-memory cache (replace with a more robust solution for production)
const productCache = {};

router.get('/products/:productId', async (req, res) => {
    const { productId } = req.params;

    // Input validation
    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check cache first
    if (productCache[productId]) {
        console.log('Cache hit for product:', productId);
        return res.status(200).json(productCache[productId]);
    }

    try {
        const product = await getProductById(productId);

        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({ error: 'Product not found' });
        }

        // Cache the product
        productCache[productId] = product;
        cache.set(productId, product); //Use external cache module

        // Handle potentially long descriptions (truncate if needed)
        const truncatedDescription = product.description.length > 500 ? product.description.substring(0, 500) + '...' : product.description;
        const productWithTruncatedDescription = {
            ...product,
            description: truncatedDescription
        };

        res.status(200).json(productWithTruncatedDescription);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

module.exports = router;