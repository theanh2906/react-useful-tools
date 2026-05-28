import React from 'react';

const ShareLinkComponent = ({ link }) => {
    return (
        <div>
            <h2>Shareable Link</h2>
            <input type='text' value={link} readOnly />
            <button onClick={() => navigator.clipboard.writeText(link)}>Copy Link</button>
        </div>
    );
};

export default ShareLinkComponent;
