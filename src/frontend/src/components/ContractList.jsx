import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // Validate JWT token and handle unauthorized access
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('Unauthorized: No token found.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('/distributor/contracts', config);

        if (response.status === 200) {
          setContracts(response.data);
        } else {
          setError('Failed to fetch contracts.');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Invalid token.');
        } else {
          setError('Failed to fetch contracts.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleDownloadContract = async (contractId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('Unauthorized: No token found.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          responseType: 'blob', // Important for downloading files
        },
      };

      const response = await axios.get(`/distributor/contracts/${contractId}`, config);

      if (response.status === 200) {
        // Create a download link
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract_${contractId}.pdf`; // Assuming PDF format
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Failed to download contract.');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert('Contract not found.');
      } else if (error.response && error.response.status === 401) {
        alert('Unauthorized: Invalid token.');
      } else {
        alert('Failed to download contract.');
        console.error(error);
      }
    }
  };

  if (loading) {
    return <p>Loading contracts...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Distributor Contracts</h2>
      <table>
        <thead>
          <tr>
            <th>Contract ID</th>
            <th>Name</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.id}</td>
              <td>{contract.name}</td>
              <td>
                <button onClick={() => handleDownloadContract(contract.id)}>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractList;