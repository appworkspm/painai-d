import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: Error | string | null;
  onRetry?: () => void;
  retryButtonText?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  retryButtonText = 'Retry',
  className = '',
}) => {
  const errorMessage = error instanceof Error ? error.message : String(error || 'An error occurred');
  const isRetryable = typeof onRetry === 'function';

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Something went wrong
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        {errorMessage}
      </p>
      {isRetryable && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryButtonText}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
