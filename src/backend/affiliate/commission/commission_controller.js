const commissionService = require('./commission_service');
const logger = require('../../logger');

/**
 * Retrieves the commission amount for a given order.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getCommissionByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const commission = await commissionService.getCommissionByOrderId(orderId);

    if (!commission) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({
      orderId: commission.orderId,
      commissionAmount: commission.commissionAmount,
    });
  } catch (error) {
    logger.error('Error retrieving commission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCommissionByOrderId,
};