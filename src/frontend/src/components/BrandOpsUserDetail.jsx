import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BrandOpsUserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await axios.get(`/api/brand_ops_users/${id}`);
                setUser(response.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return <p>Loading user...</p>;
    }

    if (error) {
        return <p>Error fetching user: {error.message}</p>;
    }

    if (!user) {
        return <p>User not found.</p>;
    }

    return (
        <div>
            <h2>User Details</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Created At:</strong> {user.created_at}</p>
            <p><strong>Updated At:</strong> {user.updated_at}</p>
        </div>
    );
};

export default BrandOpsUserDetail;