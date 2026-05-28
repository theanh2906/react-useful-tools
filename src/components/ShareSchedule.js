import React, { useState, useEffect } from 'react';
import { shareSchedule } from '../api/scheduleApi';
import './ShareSchedule.css';

const ShareSchedule = ({ userId }) => {
    const [sharingStatus, setSharingStatus] = useState(null);

    const handleShare = async () => {
        try {
            const response = await shareSchedule(userId);
            setSharingStatus(response.success ? 'Schedule shared successfully!' : 'Failed to share schedule.');
        } catch (error) {
            setSharingStatus('An error occurred while sharing the schedule.');
        }
    };

    return (
        <div className="share-schedule">
            <h2>Share Your Schedule</h2>
            <button onClick={handleShare}>Share</button>
            {sharingStatus && <p>{sharingStatus}</p>}
        </div>
    );
};

export default ShareSchedule;