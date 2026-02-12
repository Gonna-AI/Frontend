import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin opacity-30 animation-delay-200"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
