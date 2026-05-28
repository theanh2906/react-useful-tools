/**
 * Generates a public URL for sharing menstrual cycle schedules
 * @param {Object} schedule - The cycle schedule object
 * @returns {string} - Public shareable URL
 */
function generatePublicURL(schedule) {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseURL}/shared/${schedule._id}`;
}

module.exports = { generatePublicURL };