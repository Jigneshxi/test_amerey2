import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import affiliateCommissionApi from '../api/affiliateCommission';

const AffiliateCommission = () => {
  const { orderId } = useParams();
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await affiliateCommissionApi.getCommission(orderId);
        setCommission(response.data);
      } catch (err) {
        console.error('Error fetching commission:', err);
        setError(err.message);
        // Log the error for auditing purposes
        console.error('Commission calculation error for order ID:', orderId, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommission();
  }, [orderId]);

  if (loading) {
    return <p>Loading commission...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!commission) {
    return <p>Commission not found for order ID: {orderId}</p>;
  }

  return (
    <div>
      <h2>Affiliate Commission for Order ID: {commission.orderId}</h2>
      <p>Commission Amount: ${commission.commissionAmount.toFixed(2)}</p>
    </div>
  );
};

export default AffiliateCommission;