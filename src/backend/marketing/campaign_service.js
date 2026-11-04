const { v4: uuidv4 } = require('uuid');

// In-memory store for campaigns (replace with a database in production)
const campaigns = {};

/**
 * Creates a new marketing campaign.
 *
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
async function createCampaign(req, res) {
  try {
    const { title, content, schedule } = req.body;

    // Input validation to prevent injection attacks
    if (!title || !content || !schedule) {
      return res.status(400).json({ error: 'Invalid campaign data.  Title, content, and schedule are required.' });
    }

    // Authorization check (replace with actual authentication/authorization logic)
    if (!req.user || req.user.role !== 'brand_operations') {
      return res.status(403).json({ error: 'Unauthorized to create campaigns.' });
    }

    // Basic schedule validation (more robust validation might be needed)
    if (!isValidSchedule(schedule)) {
      return res.status(400).json({ error: 'Invalid schedule format. Use YYYY-MM-DDTHH:mm:ssZ' });
    }
    
    // Check for scheduling conflicts (simplified example)
    if (hasSchedulingConflict(schedule)) {
        return res.status(409).json({error: 'Scheduling conflict. Please choose a different time.'});
    }

    const campaignId = uuidv4();
    const campaign = {
      campaignId,
      title,
      content,
      schedule,
      status: 'scheduled',
    };

    campaigns[campaignId] = campaign;

    res.status(201).json({ campaign_id: campaignId });

  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
}

// Helper function for schedule validation (basic example)
function isValidSchedule(schedule) {
    try {
        new Date(schedule); //attempt to parse as date.  Throws error if invalid.
        return true;
    } catch (e) {
        return false;
    }
}

// Helper function to check for scheduling conflicts.  In a real system, this would query a database.
function hasSchedulingConflict(schedule) {
    // Simplified check:  Assume conflict if there's another campaign scheduled within the same hour.
    const scheduledTime = new Date(schedule);
    for (const campaignId in campaigns) {
        const campaign = campaigns[campaignId];
        const existingScheduleTime = new Date(campaign.schedule);

        if (Math.abs(scheduledTime.getTime() - existingScheduleTime.getTime()) < 3600000) { //3600000 ms = 1 hour
            return true;
        }
    }
    return false;
}

module.exports = {
  createCampaign,
};