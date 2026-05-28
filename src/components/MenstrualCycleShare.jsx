import React from 'react';
import './MenstrualCycleShare.css';

const MenstrualCycleShare = () => {
  const [schedule, setSchedule] = React.useState('');

  const handleInputChange = (e) => {
    setSchedule(e.target.value);
  };

  const handleShare = () => {
    // Implement sharing functionality here
    alert(`Schedule shared: ${schedule}`);
  };

  return (
    <div className="menstrual-cycle-share">
      <h2>Share Your Menstrual Cycle Schedule</h2>
      <textarea 
        value={schedule} 
        onChange={handleInputChange} 
        placeholder="Enter your schedule here..." 
        rows="5" 
        className="schedule-input"
      />
      <button onClick={handleShare} className="share-button">Share Schedule</button>
    </div>
  );
};

export default MenstrualCycleShare;