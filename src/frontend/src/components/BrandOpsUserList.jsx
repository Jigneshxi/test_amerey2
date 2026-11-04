import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Assuming MOD-022 provides a user management API
// Replace with actual import from MOD-022
// import { fetchBrandOpsUsers, deleteBrandOpsUser } from '../api/mod022';

const BrandOpsUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with actual API call from MOD-022
        // const response = await fetchBrandOpsUsers();
        // setUsers(response.data);

        // Mock Data for demonstration
        const mockUsers = [
          { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Standard' },
          { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Standard' },
        ];
        setUsers(mockUsers);

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error fetching users:", err); // Log the error for debugging
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      // Replace with actual API call from MOD-022
      // await deleteBrandOpsUser(userId);
      
      // Optimistically remove from local state
      setUsers(users.filter(user => user.id !== userId));

    } catch (err) {
      setError(err);
      console.error("Error deleting user:", err); // Log the error for debugging
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h2>Brand Operations Users</h2>
      <Link to="/brandops/user/new">Add New User</Link>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <Link to={`/brandops/user/${user.id}`}>View</Link>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrandOpsUserList;