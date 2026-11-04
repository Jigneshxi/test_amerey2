import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CatalogList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/products');
                setProducts(response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized');
                } else {
                    setError('Failed to fetch products');
                }
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setName(product.name);
        setDescription(product.description);
    };

    const handleUpdate = async () => {
        // Input validation to prevent injection attacks
        if (!name || !description) {
            setError('Name and description are required');
            return;
        }
        if (typeof name !== 'string' || typeof description !== 'string') {
            setError('Invalid input types');
            return;
        }

        try {
            const response = await axios.put(`/products/${selectedProduct.id}`, {
                name: name,
                description: description,
            });
            const updatedProducts = products.map(product =>
                product.id === selectedProduct.id ? response.data : product
            );
            setProducts(updatedProducts);
            setSelectedProduct(null);
            setName('');
            setDescription('');
            setError('');
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('Product not found');
            } else {
                setError('Failed to update product');
            }
        }
    };

    const handleDelete = async (productId) => {
        // Authorization check is handled on the backend

        try {
            // Assuming DELETE endpoint exists.  Backend implementation would be required
            // In a real application, you'd perform a DELETE request to the backend.
            const updatedProducts = products.filter(product => product.id !== productId);
            setProducts(updatedProducts);

        } catch (error) {
            setError('Failed to delete product');
        }
    };

    return (
        <div>
            <h2>Product Catalog</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        {product.name} - {product.description}
                        <button onClick={() => handleEdit(product)}>Edit</button>
                        <button onClick={() => handleDelete(product.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {selectedProduct && (
                <div>
                    <h3>Edit Product</h3>
                    <label>
                        Name:
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <label>
                        Description:
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => setSelectedProduct(null)}>Cancel</button>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CatalogList;