import React, { useState, useEffect } from 'react';
import orderApi from '../api/orderApi';
import { getJwt } from '../api/auth';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getJwt();
        if (!token) {
          throw new Error('Unauthorized');
        }

        const response = await orderApi.getOrders(token);

        if (response.status === 200) {
          setOrders(response.data);
        } else {
          setError(`Failed to fetch orders: ${response.status}`);
        }
      } catch (err) {
        if (err.message === 'Unauthorized') {
          setError('Unauthorized');
        } else {
          setError(`An error occurred: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading order history...</p>;
  }

  if (error === 'Unauthorized') {
    return <p>Unauthorized. Please log in.</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div>
      <h2>Order History</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.date}</td>
              <td>${order.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;