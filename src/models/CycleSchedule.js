const mongoose = require('mongoose');

const cycleScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    cycleDays: { type: [Date], required: true },
    shared: { type: Boolean, default: false },
    shareLink: { type: String }
});

module.exports = mongoose.model('CycleSchedule', cycleScheduleSchema);