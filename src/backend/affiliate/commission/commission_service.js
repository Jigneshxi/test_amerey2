// src/backend/affiliate/commission/commission_service.js

const logger = require('pino')(); // Assuming pino is used for logging
const { AffiliateCommission } = require('../../../db/models'); // Assuming Sequelize model
const { OrderService } = require('../../../modules/MOD-024/order_service'); // Import OrderService from MOD-024

const COMMISSION_RATE = 0.05; // 5% commission rate

/**
 * Calculates the commission for a given order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<number>} - The commission amount.  Rejects if order not found or calculation fails.
 * @throws {Error} - If there's an error during calculation or data access.
 */
async function calculateCommission(orderId) {
  try {
    const order = await OrderService.getOrderById(orderId);

    if (!order) {
      logger.error(`Order not found for orderId: ${orderId}`);
      throw new Error('Order not found');
    }

    let orderAmount = order.totalAmount;

    // Handle discounts/promotions
    if (order.discountAmount > 0) {
      orderAmount -= order.discountAmount;
    }

    const commissionAmount = orderAmount * COMMISSION_RATE;
    return commissionAmount;

  } catch (error) {
    logger.error(`Error calculating commission for orderId ${orderId}: ${error.message}`);
    throw error; // Re-throw to be handled by the controller
  }
}

/**
 * Saves the commission to the database.
 * @param {string} orderId - The ID of the order.
 * @param {number} commissionAmount - The commission amount.
 * @returns {Promise<void>}
 * @throws {Error} - If there's an error saving to the database.
 */
async function saveCommission(orderId, commissionAmount) {
  try {
    await AffiliateCommission.create({
      orderId: orderId,
      commissionAmount: commissionAmount,
    });
  } catch (error) {
    logger.error(`Error saving commission for orderId ${orderId}: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieves commission for a given order ID.
 * @param {string} orderId The ID of the order.
 * @returns {Promise<{orderId: string, commissionAmount: number}>} The commission details.
 * @throws {Error} If the order or commission is not found.
 */
async function getCommissionByOrderId(orderId) {
    try {
        const commission = await AffiliateCommission.findOne({
            where: {
                orderId: orderId
            }
        });

        if (!commission) {
            logger.warn(`Commission not found for orderId: ${orderId}`);
            throw new Error("Commission not found");
        }

        return {
            orderId: commission.orderId,
            commissionAmount: commission.commissionAmount
        };

    } catch (error) {
        logger.error(`Error getting commission for orderId ${orderId}: ${error.message}`);
        throw error;
    }
}

module.exports = {
  calculateCommission,
  saveCommission,
  getCommissionByOrderId
};