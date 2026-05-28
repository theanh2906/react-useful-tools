import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const ShareScheduleModal = ({ show, handleClose }) => {
    const [publicUrl, setPublicUrl] = React.useState('');

    const handleShare = () => {
        // Cần logic để lấy public URL cho lịch chu kỳ kinh nguyệt
        const generatedUrl = `https://example.com/share/schedule?type=menstrualCycle`;
        setPublicUrl(generatedUrl);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Your Menstrual Cycle Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Share your schedule with the following link:</p>
                <input type="text" value={publicUrl} readOnly className="form-control" />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleShare}>Generate Link</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareScheduleModal;