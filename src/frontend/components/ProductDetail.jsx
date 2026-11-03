import React, { useState, useEffect } from 'react';
import productApi from '../api/productApi';

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getProduct(productId);
        setProduct(response);
      } catch (err) {
        if (err.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to fetch product details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) { // Input validation for productId.
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!product) {
    return null; // Or a "No product found" message
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>Description: {product.description}</p>
      {/* Handle missing images, and long descriptions */}
      {/* <img src={product.imageUrl || 'placeholder.jpg'} alt={product.name} /> */}
    </div>
  );
};

export default ProductDetail;