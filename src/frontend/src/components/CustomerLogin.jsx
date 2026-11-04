import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      // Store the token in local storage or cookies
      localStorage.setItem('token', response.data.token);
      setError('');
      // Redirect to the profile page or home page
      window.location.href = '/profile'; 

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid credentials.');
      } else {
        setError('An error occurred.');
        console.error(err);
      }
    }
  };

  return (
    <div>
      <h2>Customer Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default CustomerLogin;