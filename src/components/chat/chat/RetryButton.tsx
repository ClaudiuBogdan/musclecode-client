import React, { useState } from 'react';

interface RetryButtonProps {
  messageId: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({ messageId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = async () => {
    setIsLoading(true);
    // TODO: Implement retry logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleRetry} 
      disabled={isLoading}
      className="ml-2 px-3 py-1 bg-gray-200 rounded text-sm"
    >
      {isLoading ? 'Retrying...' : 'Retry'}
    </button>
  );
};

