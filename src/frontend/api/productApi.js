import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// In-memory cache to store product details
const productCache = {};

/**
 * Fetches product details by ID.
 *
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<object>} - A promise that resolves with the product details.
 * @throws {Error} - If the product is not found (404).
 */
export const fetchProductDetails = async (productId) => {
  // Input validation
  if (!productId || typeof productId !== 'string') {
    throw new Error('Invalid productId. Product ID must be a non-empty string.');
  }

  // Check if product is in cache
  if (productCache[productId]) {
    return productCache[productId];
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);

    if (response.status === 200) {
      // Store product details in cache
      productCache[productId] = response.data;
      return response.data;
    } else {
      // Handle unexpected status codes
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Product not found
      throw new Error('Product not found');
    } else {
      // Other errors
      console.error('Error fetching product details:', error);
      throw error;
    }
  }
};

const productApi = {
  fetchProductDetails,
  searchProducts: async (query, filters) => {
    try {
      // Input validation to prevent SQL injection. Sanitize query string.
      const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '');

      const params = {
        query: sanitizedQuery,
        filters: filters || {}
      };

      const response = await axios.get(`${API_BASE_URL}/products/search`, { params });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    } catch (error) {
      // Error handling for invalid input or database errors.
      if (error.response && error.response.status === 400) {
        throw new Error('Invalid filters provided.');
      } else {
        throw new Error(`Error searching products: ${error.message}`);
      }
    }
  }
};

export default productApi;