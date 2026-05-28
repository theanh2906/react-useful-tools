import { createContext, useContext, useState } from 'react';

const ShareScheduleContext = createContext(null);

export const ShareScheduleProvider = ({ children }) => {
    const [sharedData, setSharedData] = useState({});

    const shareSchedule = (schedule) => {
        // Implement logic to create a public shareable URL
        const publicURL = `https://yourapp.com/share/schedule?data=${encodeURIComponent(JSON.stringify(schedule))}`;
        setSharedData({ ...schedule, publicURL });
        return publicURL;
    };

    return (
        <ShareScheduleContext.Provider value={{ sharedData, shareSchedule }}>
            {children}
        </ShareScheduleContext.Provider>
    );
};

export const useShareSchedule = () => {
    return useContext(ShareScheduleContext);
};