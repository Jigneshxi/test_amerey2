// src/backend/affiliate/inventory/inventory_service.js

const { getAffiliateInventory } = require('../../data_access/inventory_data_access');

/**
 * Retrieves the inventory for a specific product for an affiliate.
 *
 * @param {string} productId The ID of the product.
 * @returns {Promise<object>} A promise that resolves to an object containing the quantity, productId, and lowStockThreshold.
 * @throws {Error} If the product is not found.
 */
async function getInventory(productId) {
    try {
        const inventory = await getAffiliateInventory(productId);

        if (!inventory) {
            throw new Error('product not found');
        }

        return {
            quantity: inventory.quantity,
            productId: inventory.productId,
            lowStockThreshold: inventory.lowStockThreshold,
        };
    } catch (error) {
        console.error('Error getting inventory:', error);
        throw error; // Re-throw the error for the controller to handle.
    }
}

module.exports = {
    getInventory,
};