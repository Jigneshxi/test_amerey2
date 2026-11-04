import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [productId, setProductId] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Replace with the actual Chemist ID from authentication/session
    const chemistId = '123'; // Hardcoded for demonstration.  Should come from auth.

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/products?chemist_id=${chemistId}`);
            setProducts(response.data);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching products:', error);
            setErrorMessage('Failed to fetch products.');
        }
    };

    const handleAddProduct = async () => {
        if (!name || !price || !description) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        //Input validation and prevent SQL injection.  More robust validation may be needed
        if (typeof price !== 'number' || isNaN(price)) {
            setErrorMessage('Price must be a number.');
            return;
        }

        try {
            const response = await axios.post('/products', {
                name,
                price,
                chemist_id: chemistId,
                description,
            });

            setProducts([...products, response.data]);
            setName('');
            setPrice('');
            setDescription('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error adding product:', error);
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message || 'Invalid input');
            } else {
                setErrorMessage('Failed to add product.');
            }
        }
    };

    const handleUpdateProduct = async () => {
        if (!productId || !name || !price || !description) {
            setErrorMessage('Please fill in all fields and select a product to edit.');
            return;
        }

         //Input validation and prevent SQL injection.  More robust validation may be needed
        if (typeof price !== 'number' || isNaN(price)) {
            setErrorMessage('Price must be a number.');
            return;
        }

        try {
            const response = await axios.put(`/products/${productId}`, {
                name,
                price,
                description,
            });

            const updatedProducts = products.map(product =>
                product.product_id === productId ? { ...product, name, price, description } : product
            );
            setProducts(updatedProducts);
            setProductId('');
            setName('');
            setPrice('');
            setDescription('');
            setEditMode(false);
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.response && error.response.status === 404) {
                setErrorMessage('Product not found.');
            } else {
                setErrorMessage('Failed to update product.');
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`/products/${id}`);
            const updatedProducts = products.filter(product => product.product_id !== id);
            setProducts(updatedProducts);
            setErrorMessage('');
        } catch (error) {
            console.error('Error deleting product:', error);
            setErrorMessage('Failed to delete product.');
        }
    };


    const handleEditClick = (product) => {
        setProductId(product.product_id);
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description);
        setEditMode(true);
    };

    return (
        <div>
            <h2>Product Catalog</h2>
            {errorMessage && <div className="error">{errorMessage}</div>}

            <div>
                <h3>Add Product</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button onClick={handleAddProduct}>Add</button>
            </div>

            {editMode && (
                <div>
                    <h3>Edit Product</h3>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button onClick={handleUpdateProduct}>Update</button>
                    <button onClick={() => {setEditMode(false); setProductId(''); setName(''); setPrice(''); setDescription('');}}>Cancel</button>
                </div>
            )}

            <h3>Products</h3>
            <ul>
                {products.map(product => (
                    <li key={product.product_id}>
                        {product.name} - ${product.price} - {product.description}
                        <button onClick={() => handleEditClick(product)}>Edit</button>
                        <button onClick={() => handleDeleteProduct(product.product_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductCatalog;