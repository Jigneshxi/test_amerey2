import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chemistId, setChemistId] = useState(null); // Assuming Chemist ID is available from auth/context

  useEffect(() => {
    // Fetch Chemist ID (replace with actual authentication/context retrieval)
    const storedChemistId = localStorage.getItem('chemistId');
    if (storedChemistId) {
      setChemistId(storedChemistId);
    } else {
      // Handle case where chemist is not authenticated or ID is not available
      setError("Chemist ID not found. Please login.");
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!chemistId) return;

    const fetchOrders = async () => {
      try {
        // Replace with API call to fetch orders for the chemist
        // Assuming orders are returned as an array of objects
        const response = await fetch(`/api/orders/chemist/${chemistId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [chemistId]);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      // Replace with API call to update order status
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }

      // Update the orders state to reflect the change
      const updatedOrders = orders.map(order =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      setError(`Error updating order status: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Order Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Products</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{order.user_id}</td>
              <td>{order.product_ids.join(', ')}</td>
              <td>{order.status}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleOrderStatusUpdate(order.order_id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDashboard;