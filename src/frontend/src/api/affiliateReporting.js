import axios from 'axios';
import { getToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchAffiliatePerformanceReport = async () => {
  try {
    const response = await apiClient.get('/affiliate/reports/performance');

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Error fetching affiliate performance report:', response.status);
      return {}; // Return empty object on error
    }
  } catch (error) {
    console.error('Error fetching affiliate performance report:', error);
    return {}; // Return empty object on error
  }
};