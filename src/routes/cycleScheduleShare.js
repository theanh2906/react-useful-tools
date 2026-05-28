const express = require('express');
const router = express.Router();
const CycleSchedule = require('../models/CycleSchedule');
const { generatePublicURL } = require('../utils/urlGenerator');

// Route to create a shareable link for the menstrual cycle schedule
router.post('/share/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await CycleSchedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // Generate the public URL for sharing
        const publicURL = generatePublicURL(schedule);
        res.status(200).json({ publicURL });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;