import React, { useState } from 'react';

const CampaignBuilder = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [schedule, setSchedule] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation to prevent injection attacks
    if (!title || !content || !schedule) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // Basic validation - could be expanded with more complex regex
    if (title.length > 200 || content.length > 1000 || schedule.length > 100) {
      setErrorMessage('Input fields are too long.');
      return;
    }

    try {
      const response = await fetch('/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, schedule }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to create campaign.');
        return;
      }

      const data = await response.json();
      alert(`Campaign created with ID: ${data.campaign_id}`);
      // Reset form
      setTitle('');
      setContent('');
      setSchedule('');
      setErrorMessage('');

    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <div role="main">
      <h1>Campaign Builder</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Campaign title"
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Campaign content"
          />
        </div>
        <div>
          <label htmlFor="schedule">Schedule:</label>
          <input
            type="text"
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            aria-label="Campaign schedule"
          />
        </div>
        <button type="submit">Create Campaign</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default CampaignBuilder;