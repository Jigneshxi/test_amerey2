import React, { useState } from 'react';
import axios from 'axios';
import { sanitize } from 'dompurify';

const TicketForm = ({ userId }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input Validation
    const validationErrors = {};
    if (!subject) {
      validationErrors.subject = 'Subject is required';
    }
    if (!description) {
      validationErrors.description = 'Description is required';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Sanitize Input
    const sanitizedSubject = sanitize(subject);
    const sanitizedDescription = sanitize(description);
    
    try {
      const response = await axios.post('/tickets', {
        subject: sanitizedSubject,
        user_id: userId,
        description: sanitizedDescription,
      });

      if (response.status === 201) {
        setSuccessMessage('Ticket created successfully!');
        // Reset form
        setSubject('');
        setDescription('');
        setErrors({});
      } else {
        console.error('Ticket creation failed:', response.data);
        setErrors({ general: 'Ticket creation failed. Please try again.' });
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data); // Assuming the backend returns validation errors in a specific format
      } else {
        setErrors({ general: 'An unexpected error occurred.' });
      }
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h2>Create Support Ticket</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          {errors.subject && <span style={{ color: 'red' }}>{errors.subject}</span>}
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            cols="50"
          />
          {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
        </div>
        <button type="submit">Submit Ticket</button>
      </form>
      {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
    </div>
  );
};

export default TicketForm;