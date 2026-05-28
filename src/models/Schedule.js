import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId }], // Array to hold users with whom the schedule is shared
    // Additional schedule fields
});

export const Schedule = mongoose.model('Schedule', scheduleSchema);