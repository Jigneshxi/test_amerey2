import React, { useState } from 'react';
import axios from 'axios';

const CustomerRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic input validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('/users/register', {
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess('Registration successful!');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Email already exists.');
      } else if (err.response && err.response.status === 400) {
        setError('Validation failed.');
      } else {
        setError('An error occurred during registration.');
        console.error(err); // Log the error for debugging
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default CustomerRegister;