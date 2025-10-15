
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-secondary-green focus:border-secondary-green";
    
    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input id={id} className={`${baseClasses} ${className}`} {...props} />
        </div>
    );
};
