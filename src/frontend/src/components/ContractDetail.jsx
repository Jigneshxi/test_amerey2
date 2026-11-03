import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ContractDetail = () => {
    const { contractId } = useParams();
    const [contractDetails, setContractDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContractDetails = async () => {
            try {
                const response = await axios.get(`/distributor/contracts/${contractId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in local storage
                    }
                });
                setContractDetails(response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized. Please login.');
                } else if (err.response && err.response.status === 404) {
                    setError('Contract not found.');
                } else {
                    setError('Failed to fetch contract details.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContractDetails();
    }, [contractId]);

    if (loading) {
        return <div>Loading contract details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!contractDetails) {
        return <div>No contract details found.</div>;
    }

    const downloadContract = () => {
        // Implement download functionality here.  Consider file size limits.
        // Example:  window.open(contractDetails.fileUrl, '_blank');
        console.log("Download contract functionality not fully implemented.");
        alert("Download functionality is a placeholder.  File URL: " + contractDetails.fileUrl);
    };

    return (
        <div>
            <h2>Contract Details</h2>
            <p>Contract ID: {contractDetails.id}</p>
            <p>Contract Name: {contractDetails.name}</p>
            <p>Distributor: {contractDetails.distributor}</p>
            <p>Effective Date: {contractDetails.effectiveDate}</p>
            <p>Expiration Date: {contractDetails.expirationDate}</p>
            {/* Add other relevant contract details here */}
            <button onClick={downloadContract}>Download Contract</button>
        </div>
    );
};

export default ContractDetail;