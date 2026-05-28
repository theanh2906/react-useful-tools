import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ShareScheduleForm from './ShareScheduleForm';

const ShareSchedule = ({ schedule }) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleShare = (sharedData) => {
        // Logic to share the schedule, e.g., API call
        console.log('Schedule shared:', sharedData);
        handleClose();
        alert('Schedule shared successfully!');
    };

    return (
        <div>
            <Button variant="primary" onClick={handleShow}>Share Schedule</Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Share Menstrual Cycle Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ShareScheduleForm onShare={handleShare} schedule={schedule} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ShareSchedule;