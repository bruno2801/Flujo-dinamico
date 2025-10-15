
import React from 'react';
import type { ToastData } from '../../types';

export const Toast: React.FC<Omit<ToastData, 'id'>> = ({ message, type }) => {
    const bgColor = type === 'success' ? 'bg-secondary-green' : 'bg-red-600';

    return (
        <div className={`p-3 rounded-lg text-white font-semibold shadow-xl max-w-sm ${bgColor} transition duration-300 opacity-100 animate-fade-in-out`}>
            {message}
        </div>
    );
};
