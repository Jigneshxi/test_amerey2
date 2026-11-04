import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const productApi = {
  searchProducts: async (query, filters) => {
    try {
      // Input validation to prevent SQL injection.  Sanitize query string.
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