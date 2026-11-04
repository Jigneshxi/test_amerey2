import React, { useState, useEffect } from 'react';

const ContentEditor = ({ productId }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch existing content for the product (if any)
    // In a real application, you would make an API call here
    // to retrieve the content associated with the productId.
    // For this example, we'll just initialize with an empty string.
    setContent('');
    setError('');
  }, [productId]);

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Input validation to prevent injection attacks
    if (!content || content.length > 10000) { // Limit content length
      setError('Content must be between 1 and 10000 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header here if needed
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify({ content, product_id: productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save content.');
      } else {
        // Success! Clear the error and reset the content
        setError('');
        setContent('');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="main">
      <h1>Content Editor</h1>
      <p>Product ID: {productId}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={handleChange}
          rows="10"
          cols="80"
          aria-label="Content Editor"
          aria-required="true"
          data-testid="content-editor"
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Content'}
        </button>
      </form>
    </div>
  );
};

export default ContentEditor;