import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { generatePublicURL } from './utils';

const ShareSchedule = ({ schedule }) => {
    const [publicURL, setPublicURL] = useState('');

    const handleShare = () => {
        const url = generatePublicURL(schedule.id);
        setPublicURL(url);
        // Assuming we have a function to send the URL via social media
        shareOnSocialMedia(url);
    };

    return (
        <div>
            <h2>Share Your Menstrual Tracking Schedule</h2>
            <button onClick={handleShare}>Generate Shareable Link</button>
            {publicURL && <p>Your public URL: {publicURL}</p>}
        </div>
    );
};

ShareSchedule.propTypes = {
    schedule: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
    }).isRequired,
};

export default ShareSchedule;