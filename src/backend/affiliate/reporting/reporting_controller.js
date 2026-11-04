const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Assuming JWT is used for authentication
const { getAffiliatePerformanceData } = require('./reporting_service');

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.user = user;
    next();
  });
};

router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const performanceData = await getAffiliatePerformanceData();

    if (!performanceData) {
      return res.status(200).json({
        revenue: 0,
        totalSales: 0,
        inventoryTurnover: 0,
        topSellingProduct: null
      });
    }
    
    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching affiliate performance data:', error);
    res.status(500).json({ message: 'Failed to fetch performance data', error: error.message });
  }
});

module.exports = router;