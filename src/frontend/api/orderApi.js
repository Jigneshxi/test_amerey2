import axios from 'axios';
import { getJwt } from '../auth'; // Assuming authentication module exports getJwt

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'; // Use environment variable for base URL

const orderApi = {
    getOrders: async () => {
        try {
            const token = getJwt();

            if (!token) {
                throw new Error('Unauthorized');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.get(`${API_BASE_URL}/orders`, config);

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Request failed with status: ${response.status}`);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                return { status: 401, message: 'Unauthorized' };
            }
            console.error('Error fetching orders:', error);
            throw error; // Re-throw the error to be handled by the component
        }
    }
};

export default orderApi;