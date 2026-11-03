import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PricingRules = ({ productId }) => {
  const [pricingRules, setPricingRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [newPrice, setNewPrice] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPricingRules();
  }, [productId]);

  const fetchPricingRules = async () => {
    try {
      const response = await axios.get(`/pricing?product_id=${productId}`);
      setPricingRules(response.data);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to fetch pricing rules');
      }
    }
  };

  const handleEditRule = (ruleId) => {
    setEditingRule(ruleId);
  };

  const handleUpdatePrice = async () => {
    // Input Validation
    if (isNaN(newPrice) || newPrice < 0) {
      setError('Invalid price. Please enter a non-negative number.');
      return;
    }

    // Authorization Check (Placeholder - Replace with actual auth)
    if (!isUserAuthorized()) {
      setError('Unauthorized to modify pricing rules.');
      return;
    }

    try {
      const response = await axios.put(`/pricing/${editingRule}`, { price: newPrice });
      const updatedRules = pricingRules.map(rule =>
        rule.id === editingRule ? { ...rule, price: newPrice } : rule
      );
      setPricingRules(updatedRules);
      setEditingRule(null);
      setNewPrice(0);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Rule not found');
      } else {
        setError('Failed to update pricing rule');
      }
    }
  };

  const isUserAuthorized = () => {
    // Replace with actual authorization logic
    // This is just a placeholder
    return true;
  };

  return (
    <div>
      <h2>Pricing Rules for Product {productId}</h2>
      {error && <div className="error">{error}</div>}
      <ul>
        {pricingRules.map(rule => (
          <li key={rule.id}>
            {rule.name}: {rule.price}
            <button onClick={() => handleEditRule(rule.id)}>Edit</button>
          </li>
        ))}
      </ul>

      {editingRule && (
        <div>
          <h3>Edit Pricing Rule</h3>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
          />
          <button onClick={handleUpdatePrice}>Save</button>
          <button onClick={() => setEditingRule(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default PricingRules;