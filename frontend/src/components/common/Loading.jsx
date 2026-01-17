/**
 * ============================================
 * Loading Component
 * Made by Hammad Naeem
 * ============================================
 */

import React from 'react';

function Loading({ message = 'Loading...' }) {
    return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>{message}</p>
        </div>
    );
}

export default Loading;