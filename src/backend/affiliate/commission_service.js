const { authenticateToken } = require('../auth/auth_service'); // Assuming auth_service.js handles JWT validation
const { log } = require('../utils/logger'); // Assuming a logger utility exists

// In-memory storage for affiliates (replace with database interaction in production)
let affiliates = [];

// Function to calculate commission
function calculateCommission(orderTotal, commissionRate) {
  const commission = orderTotal * commissionRate;
  if (isNaN(commission)) {
    log.error('Commission calculation resulted in NaN. Order Total: %s, Commission Rate: %s', orderTotal, commissionRate);
    return 0; // Or throw an error, depending on desired behavior
  }
  return commission;
}

// Function to get orders for an affiliate
async function getAffiliateOrders(affiliateId) {
  // In a real implementation, this would fetch orders from a database
  // based on the affiliateId.  For this example, we'll return some mock data.
  const mockOrders = [
    { orderId: 1, orderTotal: 100, commissionRate: 0.10, affiliateId: affiliateId },
    { orderId: 2, orderTotal: 50, commissionRate: 0.05, affiliateId: affiliateId },
  ];

  // Calculate commission for each order
  const ordersWithCommission = mockOrders.map(order => {
    const commission = calculateCommission(order.orderTotal, order.commissionRate);
    return {
      ...order,
      commission: commission
    };
  });

  return ordersWithCommission;
}

// Main function to handle affiliate order requests
async function handleAffiliateOrdersRequest(req, res) {
  try {
    // Validate JWT token
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decodedToken = await authenticateToken(token);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Input validation (affiliateId)
    const affiliateId = parseInt(req.query.affiliateId); // Assuming affiliateId is passed as a query parameter
    if (isNaN(affiliateId)) {
      return res.status(400).json({ error: 'Invalid affiliateId. Must be a number.' });
    }

    // Fetch orders for the affiliate
    const orders = await getAffiliateOrders(affiliateId);

    // Return the orders
    res.status(200).json({ orders: orders });

  } catch (error) {
    log.error('Error processing affiliate order request: %s', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  handleAffiliateOrdersRequest
};