const sanitize = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db'); // Assuming you have a database connection setup in db.js

async function createTicket(req, res) {
  try {
    const { subject, user_id, description } = req.body;

    // Input Validation
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return res.status(400).json({ error: 'Subject is required and must be a non-empty string.' });
    }

    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return res.status(400).json({ error: 'User ID is required and must be a non-empty string.' });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required and must be a string.' });
    }

    // Sanitize Input
    const sanitizedSubject = sanitize(subject, {
      allowedTags: [],
      allowedAttributes: {},
    });
    const sanitizedDescription = sanitize(description, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Create Ticket
    const ticket_id = uuidv4();
    const createdAt = new Date();

    const query = `
      INSERT INTO tickets (ticket_id, user_id, subject, description, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ticket_id
    `;

    const values = [ticket_id, user_id, sanitizedSubject, sanitizedDescription, createdAt];

    const client = await db.getClient(); // Assuming db.js exports a function to get a client
    const result = await client.query(query, values);

    if (!result.rows[0]) {
      return res.status(500).json({ error: 'Failed to create ticket.' });
    }
    
    // Respond with Ticket ID
    res.status(201).json({ ticket_id: result.rows[0].ticket_id });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  createTicket,
};