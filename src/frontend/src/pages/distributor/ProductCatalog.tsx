import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Form, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { message } from 'antd';

// Mock API call (replace with actual API calls)
const fetchProducts = async (distributorId: number) => {
    // Replace with your API endpoint
    const response = await fetch(`/api/distributor/products?distributorId=${distributorId}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

const createProduct = async (product: any) => {
    // Replace with your API endpoint
    const response = await fetch('/api/distributor/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

const updateProduct = async (product: any) => {
    // Replace with your API endpoint
    const response = await fetch(`/api/distributor/products/${product.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

const deleteProduct = async (id: number) => {
    // Replace with your API endpoint
    const response = await fetch(`/api/distributor/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
};


const ProductCatalog: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [distributorId, setDistributorId] = useState(1); // Replace with actual distributor ID
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts(distributorId);
                setProducts(data);
                setLoading(false);
            } catch (error: any) {
                message.error(`Failed to load products: ${error.message}`);
                setLoading(false);
            }
        };
        loadProducts();
    }, [distributorId]);

    const handleAddProduct = async (values: any) => {
        try {
            const newProduct = { ...values, distributor_id: distributorId };
            const createdProduct = await createProduct(newProduct);
            setProducts([...products, createdProduct]);
            message.success('Product created successfully!');
        } catch (error: any) {
            message.error(`Failed to create product: ${error.message}`);
        }
    };

    const handleUpdateProduct = async (values: any) => {
        try {
            const updatedProduct = await updateProduct(values);
            const updatedProducts = products.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product
            );
            setProducts(updatedProducts);
            message.success('Product updated successfully!');
        } catch (error: any) {
            message.error(`Failed to update product: ${error.message}`);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await deleteProduct(id);
            const updatedProducts = products.filter((product) => product.id !== id);
            setProducts(updatedProducts);
            message.success('Product deleted successfully!');
        } catch (error: any) {
            message.error(`Failed to delete product: ${error.message}`);
        }
    };
    
    const handleSearch = (value: string) => {
        setSearchText(value);
        // Implement search logic here (e.g., filter the products array)
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <>
                    <EditOutlined onClick={() => {
                        // Open a modal/form to edit the product
                        // Pass the record (product) data to the form
                    }} />
                    <DeleteOutlined onClick={() => handleDeleteProduct(record.id)} />
                </>
            ),
        },
    ];

    return (
        <div>
            <h2>Product Catalog</h2>
            <Input placeholder="Search products" onChange={(e) => handleSearch(e.target.value)} style={{marginBottom: '16px'}}/>
            <Table
                columns={columns}
                dataSource={filteredProducts}
                loading={loading}
            />
            {/* Add Product Form */}
            <Form onFinish={handleAddProduct}>
                <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter product name' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input.TextArea />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                    Add Product
                </Button>
            </Form>
        </div>
    );
};

export default ProductCatalog;