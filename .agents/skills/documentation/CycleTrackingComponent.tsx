import { useShareSchedule } from '../document/ShareScheduleContext';

const CycleTrackingComponent = () => {
    const { shareSchedule } = useShareSchedule();

    const handleShare = () => {
        const schedule = { /* your schedule data */ };
        const url = shareSchedule(schedule);
        alert(`Schedule shared! Access it here: ${url}`);
    };

    return (
        <div>
            <button onClick={handleShare}>Share Schedule</button>
        </div>
    );
};

export default CycleTrackingComponent;