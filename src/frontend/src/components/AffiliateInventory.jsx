import React, { useState, useEffect } from 'react';
import { getAffiliateInventory } from '../api/affiliateInventory';

function AffiliateInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    // Fetch product IDs from local storage or a default list.  Replace with actual source
    const storedProductIds = localStorage.getItem('productIds');
    setProductIds(storedProductIds ? JSON.parse(storedProductIds) : ['product1', 'product2', 'product3']);
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      const inventoryData = [];

      for (const productId of productIds) {
        try {
          const response = await getAffiliateInventory(productId);

          if (response.status === 200) {
            inventoryData.push(response.body);
          } else {
            console.error(`Error fetching inventory for product ${productId}:`, response.status);
            setError(`Error fetching inventory for product ${productId}: ${response.status}`);
          }
        } catch (err) {
          console.error(`Error fetching inventory for product ${productId}:`, err);
          setError(`Error fetching inventory for product ${productId}: ${err.message}`);
        }
      }

      setInventory(inventoryData);
      setLoading(false);
    };

    if (productIds.length > 0) {
      fetchInventory();
    }
  }, [productIds]);


  if (loading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Affiliate Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Quantity</th>
            <th>Low Stock Threshold</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.productId}>
              <td>{item.productId}</td>
              <td>{item.quantity}</td>
              <td>{item.lowStockThreshold}</td>
              <td>
                {item.quantity < item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AffiliateInventory;