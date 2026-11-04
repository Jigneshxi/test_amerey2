import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; // Use environment variable for base URL

export const getAffiliateInventory = async (productId) => {
  try {
    // Input validation to prevent injection attacks
    if (!productId || typeof productId !== 'string' || productId.length === 0) {
      throw new Error('Invalid productId provided.');
    }

    const response = await axios.get(`${API_BASE_URL}/affiliate/inventory/${productId}`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Request failed with status: ${response.status}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Handle missing products gracefully
      throw new Error('Product not found');
    } else {
      // Handle other errors
      console.error('Error fetching affiliate inventory:', error);
      throw error; // Re-throw the error to be handled by the calling component
    }
  }
};

// Consider implementing a mechanism to handle concurrent updates (e.g., optimistic locking)
// in the backend to address the edge case of rapid changes due to concurrent orders.
// This frontend code assumes the backend handles concurrency.
export const refreshInventory = async (productId) => {
    try {
      const response = await getAffiliateInventory(productId);
      return response;
    } catch (error) {
      console.error("Error refreshing inventory", error);
      throw error;
    }
}