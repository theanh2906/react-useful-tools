import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const ShareScheduleForm = ({ onShare, schedule }) => {
    const [recipientEmail, setRecipientEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const sharedData = {
            email: recipientEmail,
            scheduleId: schedule.id,
            // Additional data if needed
        }; 
        onShare(sharedData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="recipientEmail">
                <Form.Label>Recipient Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit">Share</Button>
        </Form>
    );
};

export default ShareScheduleForm;