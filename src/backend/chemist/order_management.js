// src/backend/chemist/order_management.js

const { getProductDetails, updateInventory } = require('MOD-023'); // Assuming MOD-023 handles product and inventory details
const { v4: uuidv4 } = require('uuid');

const orders = []; // In-memory order storage.  Replace with database interaction in production.

// Function to place a new order
async function placeOrder(userId, productIds, chemistId) {
    try {
        // Validate input
        if (!userId || !Array.isArray(productIds) || productIds.length === 0 || !chemistId) {
            throw new Error('Invalid input data for order placement.');
        }

        // Check product availability and gather details
        const productDetailsList = [];
        for (const productId of productIds) {
            const productDetails = await getProductDetails(productId);
            if (!productDetails) {
                throw new Error(`Product with ID ${productId} not found.`);
            }
            productDetailsList.push(productDetails);
        }

        // Check if all products are in stock
        const outOfStockProducts = productDetailsList.filter(product => product.inventory <= 0);
        if (outOfStockProducts.length > 0) {
            const outOfStockProductIds = outOfStockProducts.map(p => p.product_id);
            throw new Error(`Products out of stock: ${outOfStockProductIds.join(', ')}.`);
        }


        // Create order object
        const orderId = uuidv4();
        const newOrder = {
            order_id: orderId,
            user_id: userId,
            product_ids: productIds,
            chemist_id: chemistId,
            status: 'pending' // Initial status
        };

        orders.push(newOrder);

        // Update inventory
        for (const productId of productIds) {
            await updateInventory(productId, -1); // Reduce inventory by 1 for each product.  Consider quantity in future versions.
        }

        return { success: true, orderId: orderId, message: 'Order placed successfully.' };

    } catch (error) {
        console.error('Error placing order:', error);
        return { success: false, message: error.message };
    }
}

// Function to update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const order = orders.find(o => o.order_id === orderId);
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid order status: ${newStatus}`);
        }

        order.status = newStatus;
        return { success: true, message: 'Order status updated successfully.' };

    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, message: error.message };
    }
}

// Function to get orders for a specific chemist
function getOrdersByChemist(chemistId) {
    try {
        if (!chemistId) {
            throw new Error('Chemist ID is required.');
        }

        const chemistOrders = orders.filter(order => order.chemist_id === chemistId);
        return { success: true, orders: chemistOrders };

    } catch (error) {
        console.error('Error getting orders by chemist:', error);
        return { success: false, message: error.message };
    }
}

// Function to get order details by order ID
function getOrderById(orderId) {
    try {
        if (!orderId) {
            throw new Error('Order ID is required.');
        }

        const order = orders.find(o => o.order_id === orderId);
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }

        return { success: true, order: order };

    } catch (error) {
        console.error('Error getting order by ID:', error);
        return { success: false, message: error.message };
    }
}


module.exports = {
    placeOrder,
    updateOrderStatus,
    getOrdersByChemist,
    getOrderById
};