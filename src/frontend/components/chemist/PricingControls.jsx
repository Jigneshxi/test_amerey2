import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PricingControls = ({ product, affiliate }) => {
  const [price, setPrice] = useState(product.price || 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrice(product.price || 0);
  }, [product.price]);

  const handlePriceChange = (event) => {
    const newPrice = parseFloat(event.target.value);
    if (isNaN(newPrice)) {
      setError('Price must be a number.');
    } else if (newPrice < 0) {
      setError('Price must be a positive number.');
    } else {
      setError('');
      setPrice(newPrice);
    }
  };

  const handleSubmit = async () => {
    if (!affiliate) {
      setError('Access denied. You are not authorized to modify prices.');
      return;
    }

    if (error) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`/products/${product.id}/price`, { price });
      if (response.status === 200) {
        // Optionally, update the product state here if needed
        // For example: setProduct({...product, price: price});
        setError(''); // clear any prior errors
        alert('Price updated successfully!');
      } else {
        setError('Failed to update price.');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Product not found.');
      } else {
        setError('An error occurred while updating the price.');
        console.error(err); // Log the error for debugging
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Pricing Controls for {product.name}</h2>
      {affiliate ? (
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={handlePriceChange}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Price'}
          </button>
        </div>
      ) : (
        <p>You are not authorized to view or modify prices.</p>
      )}
    </div>
  );
};

export default PricingControls;