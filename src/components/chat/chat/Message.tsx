import React, { useState } from "react";
import { RatingComponent } from "./RatingComponent";
import { RetryButton } from "./RetryButton";
import { Message as MessageType } from "@/types/chat";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
    >
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 border rounded"
        />
      ) : (
        <div className="inline-block max-w-3/4 p-3 rounded bg-gray-100">
          {message.content}
        </div>
      )}
      <div className="mt-2">
        {message.sender === "user" && !isEditing && (
          <button onClick={handleEdit} className="text-sm text-blue-500 mr-2">
            Edit
          </button>
        )}
        {isEditing && (
          <button onClick={handleSave} className="text-sm text-green-500 mr-2">
            Save
          </button>
        )}
        <button onClick={handleCopy} className="text-sm text-gray-500">
          Copy
        </button>
        {message.sender === "assistant" && (
          <>
            <RatingComponent messageId={message.id} />
            <RetryButton messageId={message.id} />
          </>
        )}
      </div>
    </div>
  );
};
