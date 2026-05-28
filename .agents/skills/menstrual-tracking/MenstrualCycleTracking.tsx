import React, { useState } from 'react';
import ShareScheduleModal from './ShareScheduleModal';

const MenstrualCycleTracking = () => {
    const [showShareModal, setShowShareModal] = useState(false);

    const handleShowShareModal = () => setShowShareModal(true);
    const handleCloseShareModal = () => setShowShareModal(false);

    return (
        <div>
            <h1>Menstrual Cycle Tracker</h1>
            <Button variant="primary" onClick={handleShowShareModal}>Share Schedule</Button>

            <ShareScheduleModal show={showShareModal} handleClose={handleCloseShareModal} />
        </div>
    );
};

export default MenstrualCycleTracking;