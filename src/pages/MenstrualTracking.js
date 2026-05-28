import React from 'react';
import ShareSchedule from './ShareSchedule';

const MenstrualTracking = ({ schedule }) => {
    return (
        <div>
            <h2>Menstrual Tracking</h2>
            {/* Other components and logic for menstrual tracking */}
            <ShareSchedule schedule={schedule} />
        </div>
    );
};

export default MenstrualTracking;