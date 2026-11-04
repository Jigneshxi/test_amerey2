import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/'; // Use environment variable for base URL

const orderApi = {
  placeOrder: async (items, paymentMethod, shippingAddress) => {
    // Must validate all order data.
    if (!items || items.length === 0 || !paymentMethod || !shippingAddress) {
      return Promise.reject({ status: 400, message: 'Invalid order details' });
    }

    // Encrypt sensitive payment information.  (Placeholder - replace with actual encryption)
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
        // Error handling for invalid data or payment failures.
        if (error.response.status === 400) {
          return Promise.reject({ status: 400, message: error.response.data?.message || 'Invalid order details' });
        } else if (error.response.status === 500) {
          return Promise.reject({ status: 500, message: 'Payment processing error' });
        } else {
          return Promise.reject({ status: error.response.status, message: 'Order placement failed' });
        }
      } else if (error.request) {
        // Handle network errors
        return Promise.reject({ status: 500, message: 'Network error' });
      } else {
        // Handle other errors
        return Promise.reject({ status: 500, message: 'Order placement failed' });
      }
    }
  },
  encryptPaymentInfo: (paymentMethod) => {
    // Placeholder for encryption logic.  In a real application, this would use a robust encryption library.
    // Must not log raw token values.
    // Important: Never log the actual encrypted or unencrypted payment information!
    return `ENCRYPTED_${paymentMethod}`; // Replace with real encryption.
  },
};

export default orderApi;