import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AffiliateDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Assuming JWT token is stored in localStorage or cookies
        const token = localStorage.getItem('jwtToken'); // Or however you store the token
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/login';
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('/affiliate/orders', config);

        if (response.status === 200) {
          setOrders(response.data.orders);
          calculateTotalCommission(response.data.orders);
          checkLowStock(response.data.orders);
        } else {
          console.error('Failed to fetch orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const calculateTotalCommission = (orders) => {
    let total = 0;
    orders.forEach((order) => {
      // Assuming each order has a 'commission' property
      if (order.commission) {
        total += order.commission;
      } else {
        console.error('Commission not found in order:', order); // Log errors
      }
    });
    setTotalCommission(total);
  };

  const checkLowStock = (orders) => {
    const alerts = [];
    const productStock = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        productStock[item.productId] = (productStock[item.productId] || 0) + item.quantity;
      });
    });

    // Simulate low stock threshold (e.g., 10)
    const lowStockThreshold = 10;

    for (const productId in productStock) {
      if (productStock[productId] < lowStockThreshold) {
        alerts.push(`Product ${productId} is running low! Current stock: ${productStock[productId]}`);
      }
    }

    setLowStockAlerts(alerts);
  };

  return (
    <div>
      <h1>Affiliate Dashboard</h1>

      <h2>Your Orders</h2>
      {orders.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.totalAmount}</td>
                <td>{order.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}

      <h2>Total Commission</h2>
      <p>${totalCommission.toFixed(2)}</p>

      <h2>Low Stock Alerts</h2>
      {lowStockAlerts.length > 0 ? (
        <ul>
          {lowStockAlerts.map((alert, index) => (
            <li key={index}>{alert}</li>
          ))}
        </ul>
      ) : (
        <p>No low stock alerts.</p>
      )}
    </div>
  );
};

export default AffiliateDashboard;