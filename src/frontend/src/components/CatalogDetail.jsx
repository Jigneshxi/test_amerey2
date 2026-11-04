import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CatalogDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/products/${productId}`);
        setProduct(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else if (err.response && err.response.status === 401) {
          setError('Unauthorized.');
        } else {
          setError('Failed to fetch product.');
        }
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input Validation to prevent injection attacks
    if (!name || !description) {
      setError('Name and description are required.');
      return;
    }

    if (name.length > 255 || description.length > 1000) {
      setError('Name must be less than 255 characters and description less than 1000.');
      return;
    }

    try {
      const response = await axios.put(`/products/${productId}`, {
        name,
        description,
      });
      setProduct(response.data);
      setError('');
      alert('Product updated successfully!');

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Product not found.');
      } else if (err.response && err.response.status === 401) {
        setError('Unauthorized.');
      }
      else {
        setError('Failed to update product.');
      }
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="catalog-detail">
      <h2>Product Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default CatalogDetail;