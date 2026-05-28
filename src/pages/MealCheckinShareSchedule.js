import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMealCheckinDetails, createShareableLink } from '../api/mealCheckinApi';
import ShareLinkComponent from '../components/ShareLinkComponent';

const MealCheckinShareSchedule = () => {
    const { id } = useParams();
    const [mealCheckin, setMealCheckin] = useState(null);
    const [shareableLink, setShareableLink] = useState('');

    useEffect(() => {
        const fetchMealCheckin = async () => {
            const data = await getMealCheckinDetails(id);
            setMealCheckin(data);
        };
        fetchMealCheckin();
    }, [id]);

    const handleShareSchedule = async () => {
        if (mealCheckin) {
            const link = await createShareableLink(mealCheckin.id);
            setShareableLink(link);
        }
    };

    return (
        <div>
            <h1>Share Meal Checkin Schedule</h1>
            {mealCheckin && <p>{`Schedule for: ${mealCheckin.title}`}</p>}
            <button onClick={handleShareSchedule}>Create Shareable Link</button>
            {shareableLink && <ShareLinkComponent link={shareableLink} />}
        </div>
    );
};

export default MealCheckinShareSchedule;
