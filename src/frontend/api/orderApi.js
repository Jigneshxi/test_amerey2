import axios from 'axios';
import { getJwt } from '../auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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
      throw error;
    }
  },
  placeOrder: async (items, paymentMethod, shippingAddress) => {
    if (!items || items.length === 0 || !paymentMethod || !shippingAddress) {
      return Promise.reject({ status: 400, message: 'Invalid order details' });
    }
    const encryptedPaymentMethod = orderApi.encryptPaymentInfo(paymentMethod);
    const orderData = {
      items,
      paymentMethod: encryptedPaymentMethod,
      shippingAddress,
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      if (response.status === 201) {
        return { orderId: response.data.orderId };
      } else {
        return Promise.reject({ status: response.status, message: 'Order placement failed' });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          return Promise.reject({ status: 400, message: error.response.data?.message || 'Invalid order details' });
        } else if (error.response.status === 500) {
          return Promise.reject({ status: 500, message: 'Payment processing error' });
        } else {
          return Promise.reject({ status: error.response.status, message: 'Order placement failed' });
        }
      } else if (error.request) {
        return Promise.reject({ status: 500, message: 'Network error' });
      } else {
        return Promise.reject({ status: 500, message: 'Order placement failed' });
      }
    }
  },
  encryptPaymentInfo: (paymentMethod) => {
    return `ENCRYPTED_${paymentMethod}`;
  },
};

export default orderApi;