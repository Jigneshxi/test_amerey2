import React, { useState, useEffect } from 'react';
import productApi from '../api/productApi';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    // Input Validation to prevent SQL injection
    const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9\s]/g, '');
    if (!sanitizedSearchTerm) {
      setError('Please enter a valid search term.');
      setLoading(false);
      return;
    }

    try {
      const response = await productApi.searchProducts({
        query: sanitizedSearchTerm,
        filters: filters,
      });

      if (response.status === 200) {
        setResults(response.body);
      } else {
        setError('Failed to fetch products.');
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('Invalid filters provided.');
      } else {
        setError('An error occurred while searching.');
        console.error(err); // Log the full error for debugging
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  useEffect(() => {
    // Implement rate limiting (example - adjust as needed)
    const timeoutId = setTimeout(handleSearch, 300); // 300ms delay
    return () => clearTimeout(timeoutId);

  }, [searchTerm, filters]);


  return (
    <div>
      <h2>Product Search</h2>
      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        {/* Example Filter (add more as needed) */}
        <label htmlFor="priceRange">Price Range:</label>
        <input
          type="number"
          id="priceRange"
          value={filters.priceRange || ''}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {results.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>

      {results.length === 0 && !loading && <p>No products found.</p>}
    </div>
  );
};

export default ProductSearch;