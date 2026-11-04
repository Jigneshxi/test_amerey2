```jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CampaignScheduler = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation to prevent injection attacks
    if (!title || !content || !scheduledTime) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // Basic sanitization (more robust sanitization would be needed in a production app)
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '');
    const sanitizedContent = content.replace(/[^a-zA-Z0-9\s]/g, '');

    try {
      const response = await fetch('/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header here if needed
        },
        body: JSON.stringify({
          title: sanitizedTitle,
          content: sanitizedContent,
          schedule: scheduledTime.toISOString(),
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        setSuccessMessage(`Campaign scheduled successfully with ID: ${data.campaign_id}`);
        setErrorMessage('');
        setTitle('');
        setContent('');
        setScheduledTime(null);
      } else if (response.status === 400) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid campaign data');
        setSuccessMessage('');
      } else {
        setErrorMessage(`Campaign scheduling failed with status: ${response.status}`);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
      setSuccessMessage('');
    }
  };

  return (
    <div role="main">
      <h1>Campaign Scheduler</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Campaign Title"
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Campaign Content"
            required
          />
        </div>
        <div>
          <label htmlFor="schedule">Schedule:</label>
          <DatePicker
            id="schedule"
            selected={scheduledTime}
            onChange={(date) => setScheduledTime(date)}
            showTimeSelect
            dateFormat="Pp"
            aria-label="Campaign Schedule"
            required
          />
        </div>
        <button type="submit">Schedule Campaign</button>
      </form>

      {errorMessage && <div className="error">{errorMessage}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
    </div>
  );
};

export default CampaignScheduler;
```