import axios from 'axios';
import { API_BASE_URL } from '../config'; // Assuming you have a config file for base URL

const affiliateCommissionApi = {
  /**
   * Retrieves the commission amount for a given order ID.
   * @param {string} orderId - The ID of the order.
   * @returns {Promise<object>} - A promise that resolves to an object containing the order ID and commission amount.
   * @throws {Error} - If the order is not found or if an error occurs during the API call.
   */
  getOrderCommission: async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/affiliate/commission/${orderId}`);

      if (response.status === 200) {
        return response.data;
      } else {
        // Handle unexpected error statuses
        console.error(`Error fetching commission for order ${orderId}: Status ${response.status}`);
        throw new Error(`Failed to fetch commission for order ${orderId}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Handle order not found error
        console.warn(`Order not found for orderId: ${orderId}`);
        throw new Error("Order not found");
      } else {
        // Log other errors for auditing
        console.error("Error fetching commission:", error);
        throw error; // Re-throw the error to be handled by the calling component
      }
    }
  },
};

export default affiliateCommissionApi;