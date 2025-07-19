import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
  fullScreen = false,
  spinnerSize = 'lg',
}) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen flex flex-col items-center justify-center bg-gray-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <LoadingSpinner size={spinnerSize} />
      {message && (
        <p className="mt-4 text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
