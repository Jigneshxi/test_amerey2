const jwt = require('jsonwebtoken');
const { getLowStockItems } = require('../product/product_service'); // Assuming product_service.js exists and exports this function

// Mock database for simplicity. Replace with actual database connection.
const affiliates = [
    { id: 1, name: 'Affiliate A', jwtToken: 'tokenA' },
    { id: 2, name: 'Affiliate B', jwtToken: 'tokenB' },
];

const orders = [
    { id: 1, affiliateId: 1, amount: 100, status: 'completed' },
    { id: 2, affiliateId: 2, amount: 50, status: 'pending' },
    { id: 3, affiliateId: 1, amount: 75, status: 'completed' },
];

async function authenticateAffiliate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Replace with your actual secret key
        const affiliate = affiliates.find(a => a.jwtToken === token);
        if (!affiliate) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.affiliate = affiliate;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}


async function getAffiliateOrders(req, res) {
    try {
        await authenticateAffiliate(req, res, () => {});

        const affiliateId = req.affiliate.id;

        // Input Validation - prevent injection attacks
        if (typeof affiliateId !== 'number' || affiliateId <= 0) {
            return res.status(400).json({ message: 'Invalid affiliate ID' });
        }

        const affiliateOrders = orders.filter(order => order.affiliateId === affiliateId);
        res.status(200).json({ orders: affiliateOrders });

    } catch (error) {
        console.error('Error fetching affiliate orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
}

async function checkLowStockAndAlert(affiliateId) {
    try {
        const lowStockItems = await getLowStockItems();
        if (lowStockItems.length > 0) {
            // Implement alerting mechanism (e.g., email, notification)
            console.log(`Alert for Affiliate ${affiliateId}: Low stock items - ${lowStockItems.map(item => item.name).join(', ')}`);
            // In a real application, you would send an email or notification here
        }
    } catch (error) {
        console.error('Error checking low stock:', error);
        //Log error for auditing.
        console.error('Commission Calculation Error:', error);
    }
}



module.exports = {
    getAffiliateOrders,
    authenticateAffiliate,
    checkLowStockAndAlert
};