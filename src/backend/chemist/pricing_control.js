const { getProduct, updateProduct } = require('../../../MOD-023'); // Assuming MOD-023 handles product data access
const { authenticateAffiliate } = require('../auth/auth_middleware'); // Assuming authentication middleware exists

/**
 * Updates the price of a product.
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Promise<void>}
 */
async function updateProductPrice(req, res) {
    const { product_id } = req.params;
    const { price } = req.body;

    // Input validation
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Invalid price. Price must be a positive number.' });
    }

    // Access control: Check if the user is an authenticated affiliate
    const affiliate = await authenticateAffiliate(req, res);
    if (!affiliate) {
        return; // Authentication failed, authenticateAffiliate handles the response
    }
    
    try {
        const product = await getProduct(product_id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Concurrent price updates handling (basic optimistic locking)
        // In a real-world scenario, consider more robust mechanisms like database transactions
        const originalPrice = product.price;
        
        // Limit price to prevent extremely high or low values
        const maxPrice = 1000000; // Example maximum price
        const minPrice = 0.01; // Example minimum price

        if (price > maxPrice || price < minPrice) {
            return res.status(400).json({ error: `Price must be between ${minPrice} and ${maxPrice}.` });
        }

        product.price = price;
        await updateProduct(product);

        res.status(200).json({ message: 'Price updated' });

    } catch (error) {
        console.error('Error updating product price:', error);
        res.status(500).json({ error: 'Failed to update price' });
    }
}


module.exports = {
    updateProductPrice
};