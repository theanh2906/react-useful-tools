import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenstrualTracking from '../pages/MenstrualTracking';

const MenstrualTrackingContainer = () => {
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await axios.get('/api/menstrual-schedule'); // Assuming a REST API endpoint
                setSchedule(response.data);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            }
        };
        fetchSchedule();
    }, []);

    if (!schedule) return <div>Loading...</div>;

    return <MenstrualTracking schedule={schedule} />;
};

export default MenstrualTrackingContainer;