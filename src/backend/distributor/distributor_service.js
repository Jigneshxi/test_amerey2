// src/backend/distributor/distributor_service.js

const { authenticateToken } = require('../auth/auth_service'); // Assuming auth_service.js exists and exports authenticateToken
const db = require('../db'); // Assuming db.js handles database connections

async function getDistributorOrders(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const userId = authenticateToken(token); // Validate JWT and extract user ID

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
      
        const orders = await db.query(
            'SELECT * FROM distributors_orders WHERE distributor_id = $1',
            [userId]
        );

        res.status(200).json(orders.rows);

    } catch (error) {
        console.error("Error getting distributor orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}

async function fulfillOrder(req, res) {
    const orderId = req.params.orderId;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const userId = authenticateToken(token);

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    try {
        // Verify distributor has access to the order
        const orderCheck = await db.query(
            'SELECT * FROM distributors_orders WHERE id = $1 AND distributor_id = $2',
            [orderId, userId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Distributor does not have access to this order' });
        }

        // Update order status to fulfilled
        await db.query(
            'UPDATE distributors_orders SET status = $1 WHERE id = $2',
            ['fulfilled', orderId]
        );

        res.status(200).json({ message: 'Order fulfilled successfully' });

    } catch (error) {
        console.error("Error fulfilling order:", error);
        res.status(500).json({ message: "Error fulfilling order", error: error.message });
    }
}

async function cancelOrder(req, res) {
    const orderId = req.params.orderId;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const userId = authenticateToken(token);

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    try {
        // Verify distributor has access to the order
        const orderCheck = await db.query(
            'SELECT * FROM distributors_orders WHERE id = $1 AND distributor_id = $2',
            [orderId, userId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Distributor does not have access to this order' });
        }

        // Check if order is already fulfilled or shipped. Cannot cancel.
        const orderStatus = await db.query('SELECT status FROM distributors_orders WHERE id = $1', [orderId]);
        if (orderStatus.rows[0].status === 'fulfilled' || orderStatus.rows[0].status === 'shipped') {
            return res.status(400).json({ message: 'Cannot cancel order. Order is already fulfilled or shipped.' });
        }

        // Cancel the order
        await db.query(
            'UPDATE distributors_orders SET status = $1 WHERE id = $2',
            ['cancelled', orderId]
        );

        res.status(200).json({ message: 'Order cancelled successfully' });

    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Error cancelling order", error: error.message });
    }
}

async function getOrderShipmentInfo(req, res) {
    const orderId = req.params.orderId;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const userId = authenticateToken(token);

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    try {
        // Verify distributor has access to the order
        const orderCheck = await db.query(
            'SELECT * FROM distributors_orders WHERE id = $1 AND distributor_id = $2',
            [orderId, userId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Distributor does not have access to this order' });
        }

        // Retrieve shipment information
        const shipmentInfo = await db.query(
            'SELECT shipment_details FROM distributors_orders WHERE id = $1',
            [orderId]
        );

        if (shipmentInfo.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment information not found for this order' });
        }

        res.status(200).json(shipmentInfo.rows[0].shipment_details);

    } catch (error) {
        console.error("Error getting shipment info:", error);
        res.status(500).json({ message: "Error fetching shipment info", error: error.message });
    }
}


module.exports = {
    getDistributorOrders,
    fulfillOrder,
    cancelOrder,
    getOrderShipmentInfo
};