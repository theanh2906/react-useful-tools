import axios from 'axios';

export const getMealCheckinDetails = async (id) => {
    try {
        const response = await axios.get(`/api/meal-checkins/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching meal checkin details:', error);
        throw error;
    }
};

export const createShareableLink = async (mealCheckinId) => {
    try {
        const response = await axios.post(`/api/meal-checkins/${mealCheckinId}/share`);
        return response.data.link;
    } catch (error) {
        console.error('Error creating shareable link:', error);
        throw error;
    }
};
