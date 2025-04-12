import { apiClient } from "@/lib/api/client";
import {
  ChatMessage,
  ChatSession,
  ContextReference,
  ContentElement,
  ChatSessionMetadata, // Ensure ContentElement is imported
} from "../types"; // Adjust path as needed

// Base API URL - should be configured from environment variables
// Example: Set in a .env file and use process.env.REACT_APP_API_BASE_URL or similar
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/chat";

// Define the expected payload structure for creating a session
interface CreateSessionPayload {
  title?: string;
  attachedContext?: ContextReference[];
  metadata?: ChatSessionMetadata;
  // Add other fields the backend expects for session creation
}

// Define the expected payload structure for sending a message
// This reflects the 'backendPayload' created in the store's addMessage
interface MessagePayload {
  content: ContentElement[];
  // Include other fields the backend expects when sending a message
  // For example: parentId, threadId, runId, specific metadata
  metadata?: Record<string, unknown>;
  parentId?: string;
  // Role might be inferred by the backend endpoint or could be required here
  role?: ChatMessage["role"]; // Optional: If backend needs it explicitly
}

// --- Real API Implementation (using Axios) ---
const api = {
  async fetchSessions(): Promise<ChatSession[]> {
    console.log(`[API] GET ${API_BASE_URL}/sessions`);
    const response = await apiClient.get<ChatSession[]>(
      `${API_BASE_URL}/sessions`
    );
    // Ensure messages array exists even if API omits it for empty sessions
    return response.data.map((s) => ({ ...s, messages: s.messages || [] }));
  },

  // Updated signature
  async createSessionAPI(
    sessionData: CreateSessionPayload
  ): Promise<ChatSession> {
    console.log(`[API] POST ${API_BASE_URL}/sessions`, sessionData);
    const response = await apiClient.post<ChatSession>(
      `${API_BASE_URL}/sessions`,
      sessionData
    );
    // Ensure messages array exists
    response.data.messages = response.data.messages || [];
    return response.data;
  },

  async deleteSessionAPI(sessionId: string): Promise<void> {
    console.log(`[API] DELETE ${API_BASE_URL}/sessions/${sessionId}`);
    await apiClient.delete(`${API_BASE_URL}/sessions/${sessionId}`);
  },

  // Updated signature
  async sendMessageAPI(message: MessagePayload): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(
      `/api/v1/chat/messages`,
      {
        message,
      }
    );
    // Assuming backend returns the final message object with status:'completed' etc.
    return response.data;
  },

  async fetchMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    console.log(`[API] GET ${API_BASE_URL}/sessions/${sessionId}/messages`);
    const response = await apiClient.get<ChatMessage[]>(
      `${API_BASE_URL}/sessions/${sessionId}/messages`
    );
    return response.data;
  },
};

export default api;
