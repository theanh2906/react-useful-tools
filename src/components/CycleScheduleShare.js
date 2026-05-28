import axios from 'axios';
import React, { useState } from 'react';

const CycleScheduleShare = ({ scheduleId }) => {
    const [shareLink, setShareLink] = useState('');

    const handleShare = async () => {
        try {
            const response = await axios.post(`/api/share/${scheduleId}`);
            setShareLink(response.data.publicURL);
        } catch (error) {
            console.error('Error sharing cycle schedule:', error);
        }
    };

    return (
        <div>
            <button onClick={handleShare}>Share Schedule</button>
            {shareLink && <p>Share this link: <a href={shareLink} target='_blank' rel='noopener noreferrer'>{shareLink}</a></p>}
        </div>
    );
};

export default CycleScheduleShare;