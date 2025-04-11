import { useState } from "react";
import useChatState from "../hooks/useChatState";
import { ChatMessage, ContextReference } from "../types";

/**
 * Example component to demonstrate the chat store usage
 */
export const ChatExample = () => {
  const [messageText, setMessageText] = useState("");
  const {
    currentSession,
    currentSessionId,
    sessions,
    isLoading,
    isSyncing,
    error,
    createSession,
    switchSession,
    deleteSession,
    sendTextMessage,
    attachContext,
    clearError,
  } = useChatState();

  // Get all messages in the current session
  const messages = currentSession?.messages || [];

  // Create a new chat session
  const handleCreateSession = async () => {
    try {
      const session = await createSession("New Chat");
      console.log("Created session:", session);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  // Delete the current session
  const handleDeleteSession = async () => {
    if (!currentSessionId) return;

    try {
      await deleteSession(currentSessionId);
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !currentSessionId) return;

    try {
      await sendTextMessage(messageText);
      setMessageText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Add example context
  const handleAddContext = () => {
    if (!currentSessionId) return;

    const exampleContext: ContextReference = {
      id: "example-context-1",
      type: "key_value",
      title: "Example Context",
      key_value: {
        key: "example",
        value: "This is an example context value",
      },
    };

    attachContext(currentSessionId, exampleContext);
  };

  // Format message timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Render message content
  const renderMessageContent = (message: ChatMessage) => {
    return message.content.map((content, index) => {
      // Only handle text content in this example
      if (content.type === "text") {
        return <p key={index}>{content.value}</p>;
      }

      // For other content types, just show the type
      return <p key={index}>[{content.type} content]</p>;
    });
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error.message}</p>
        <button
          onClick={clearError}
          className="mt-2 px-3 py-1 bg-red-200 hover:bg-red-300 rounded-md"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading chat sessions...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">
            {currentSession?.title || "No Session Selected"}
          </h2>
          {isSyncing && (
            <span className="text-xs text-gray-500">(Syncing...)</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateSession}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            New Chat
          </button>
          {currentSessionId && (
            <button
              onClick={handleDeleteSession}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          )}
          {currentSessionId && (
            <button
              onClick={handleAddContext}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
            >
              Add Context
            </button>
          )}
        </div>
      </div>

      {/* Session selector */}
      <div className="p-4 border-b">
        <label className="block text-sm font-medium mb-2">
          Select Session:
        </label>
        <select
          value={currentSessionId || ""}
          onChange={(e) => switchSession(e.target.value)}
          className="w-full p-2 border rounded-md"
          disabled={Object.keys(sessions).length === 0}
        >
          <option value="" disabled>
            {Object.keys(sessions).length === 0
              ? "No sessions available"
              : "Select a session"}
          </option>
          {Object.values(sessions).map((session) => (
            <option key={session.id} value={session.id}>
              {session.title || `Chat ${session.id.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            {currentSessionId
              ? "No messages yet. Send a message to start the conversation."
              : "Select a session to view messages."}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-8"
                  : "bg-gray-100 mr-8"
              }`}
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{message.role}</span>
                <span>{formatTimestamp(message.createdAt)}</span>
              </div>
              <div>{renderMessageContent(message)}</div>
              {message.status && (
                <div className="text-xs italic mt-1">
                  Status: {message.status}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md"
          disabled={!currentSessionId}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          disabled={!currentSessionId || !messageText.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatExample;
