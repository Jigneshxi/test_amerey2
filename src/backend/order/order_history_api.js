const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

// Mock order data (replace with database interaction in a real application)
const orders = [
    { userId: 'user123', date: '2024-01-15', total: 120.50, orderId: 'ord1' },
    { userId: 'user123', date: '2024-02-20', total: 85.00, orderId: 'ord2' },
    { userId: 'user456', date: '2024-03-10', total: 250.75, orderId: 'ord3' }
];

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    });
}

// GET /orders - Retrieve order history
router.get('/orders', authenticateToken, (req, res) => {
    // Authorization check: Ensure the user can only access their own orders
    const userId = req.user.userId;

    const userOrders = orders.filter(order => order.userId === userId);

    // Transform data to match the expected response format
    const formattedOrders = userOrders.map(order => ({
        date: order.date,
        total: order.total,
        orderId: order.orderId
    }));

    // Handle user with no orders
    if (formattedOrders.length === 0) {
        return res.status(200).json([]);
    }

    res.status(200).json(formattedOrders);
});

module.exports = router;