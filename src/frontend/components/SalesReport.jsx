import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDate } from '../utils/dateUtils'; // Assuming utils folder exists
import { getToken } from '../utils/auth'; // Assuming auth utils folder exists

const SalesReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await axios.get('/reports/sales', {
        params: {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSalesData(response.data);
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Invalid date range.");
      } else {
        setError("Failed to fetch sales data. Please check the server or your connection.");
        console.error("Error fetching sales data:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSalesData();
  };

  return (
    <div>
      <h2>Sales Report</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={formatDate(startDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              handleStartDateChange(newDate);
            }}
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={formatDate(endDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              handleEndDateChange(newDate);
            }}
          />
        </div>
        <button type="submit">Generate Report</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {salesData && (
        <div>
          <h3>Total Sales: ${salesData.total_sales}</h3>
          <h4>Orders:</h4>
          <ul>
            {salesData.orders.map((order) => (
              <li key={order.id}>
                Order ID: {order.id}, Amount: ${order.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SalesReport;