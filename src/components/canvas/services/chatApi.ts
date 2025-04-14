import { apiClient } from "@/lib/api/client";
import { ChatMessage, ContentBlock } from "../types"; // Adjust path as needed

// Define the expected payload structure for sending a message
// This reflects the 'backendPayload' created in the store's addMessage
interface MessagePayload {
  content: ContentBlock[];
  // Include other fields the backend expects when sending a message
  // For example: parentId, threadId, runId, specific metadata
  metadata?: Record<string, unknown>;
  parentId?: string;
  // Role might be inferred by the backend endpoint or could be required here
  role?: ChatMessage["role"]; // Optional: If backend needs it explicitly
}

// --- Real API Implementation (using Axios) ---
const api = {
  // Updated signature
  async sendMessageAPI(
    message: MessagePayload,
    responseMessage: { id: string }
  ): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(
      `/api/v1/chat/messages`,
      {
        message,
        responseMessage,
      }
    );
    // Assuming backend returns the final message object with status:'completed' etc.
    return response.data;
  },
};

export default api;
