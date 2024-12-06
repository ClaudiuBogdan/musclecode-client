import React, { useState } from 'react';

interface NewChatButtonProps {
  onNewChat: () => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onNewChat }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onNewChat();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        New Chat
      </button>
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <p>Are you sure you want to start a new chat?</p>
            <button onClick={handleConfirm} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">Yes</button>
            <button onClick={handleCancel} className="px-4 py-2 bg-red-500 text-white rounded">No</button>
          </div>
        </div>
      )}
    </>
  );
};

