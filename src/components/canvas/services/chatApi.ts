import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  ChatSession,
  ContextReference,
  ContentElement, // Ensure ContentElement is imported
} from "../types"; // Adjust path as needed

// Base API URL - should be configured from environment variables
// Example: Set in a .env file and use process.env.REACT_APP_API_BASE_URL or similar
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/chat";

// Define the expected payload structure for creating a session
interface CreateSessionPayload {
  title?: string;
  attachedContext?: ContextReference[];
  metadata?: Record<string, unknown>;
  // Add other fields the backend expects for session creation
}

// Define the expected payload structure for sending a message
// This reflects the 'backendPayload' created in the store's addMessage
interface SendMessagePayload {
  content: ContentElement[];
  // Include other fields the backend expects when sending a message
  // For example: parentId, threadId, runId, specific metadata
  metadata?: Record<string, unknown>;
  parentId?: string;
  // Role might be inferred by the backend endpoint or could be required here
  role?: ChatMessage["role"]; // Optional: If backend needs it explicitly
}

// Helper function to create a mock implementation for development/testing
const createMockImplementation = () => {
  // In-memory storage for mock backend
  const mockSessions: Record<string, ChatSession> = {};

  // Mock delay to simulate network latency
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  return {
    async fetchSessions(): Promise<ChatSession[]> {
      console.log("[MOCK API] fetchSessions called");
      await delay(500);
      // Return copies to prevent direct mutation of mock storage from outside
      return JSON.parse(JSON.stringify(Object.values(mockSessions)));
    },

    // Updated signature: takes a single payload object
    async createSessionAPI(
      sessionData: CreateSessionPayload
    ): Promise<ChatSession> {
      console.log("[MOCK API] createSessionAPI called with:", sessionData);
      await delay(300);
      const id = uuidv4();
      const now = new Date().toISOString();
      const session: ChatSession = {
        id,
        // Use provided title or generate default
        title:
          sessionData.title || `Chat ${Object.keys(mockSessions).length + 1}`,
        createdAt: now,
        updatedAt: now,
        messages: [], // Start with empty messages
        // Use provided context or initialize if needed
        attachedContext: sessionData.attachedContext || [],
        metadata: sessionData.metadata || {},
        // lastMessagesSyncAt is client-only, not stored/returned by backend
      };
      mockSessions[id] = session;
      console.log("[MOCK API] Session created:", session);
      // Return a copy
      return JSON.parse(JSON.stringify(session));
    },

    async deleteSessionAPI(sessionId: string): Promise<void> {
      console.log(`[MOCK API] deleteSessionAPI called for: ${sessionId}`);
      await delay(300);
      if (!mockSessions[sessionId]) {
        console.warn(`[MOCK API] Session ${sessionId} not found for deletion.`);
        // Decide if mock should throw or just proceed
        // throw new Error(`Mock Session with ID ${sessionId} not found`);
      }
      delete mockSessions[sessionId];
      console.log(`[MOCK API] Session ${sessionId} deleted.`);
    },

    // Updated signature: takes SendMessagePayload
    async sendMessageAPI(
      sessionId: string,
      payload: SendMessagePayload
    ): Promise<ChatMessage> {
      console.log(
        `[MOCK API] sendMessageAPI called for session ${sessionId} with payload:`,
        payload
      );
      await delay(800);

      const session = mockSessions[sessionId];
      if (!session) {
        console.error(`[MOCK API] Session ${sessionId} not found.`);
        throw new Error(`Session with ID ${sessionId} not found`);
      }

      const now = new Date().toISOString();
      // Construct the full ChatMessage using the payload
      // Role: Backend might infer 'user' for this endpoint, or payload could include it. Mock assumes 'user' if not provided.
      const sentMessage: ChatMessage = {
        id: uuidv4(), // Backend generates ID
        role: payload.role || "user", // Assume user if role not in payload
        content: payload.content,
        createdAt: now,
        // Include other fields from payload if they exist (e.g., metadata, parentId)
        metadata: payload.metadata,
        parentId: payload.parentId,
        status: "completed", // Assume backend marks as completed on successful save
      };

      session.messages.push(sentMessage);
      session.updatedAt = now; // Update session timestamp

      console.log(
        `[MOCK API] Message added to session ${sessionId}:`,
        sentMessage
      );

      // Simulate AI response only if the sent message was from a user
      if (sentMessage.role === "user") {
        console.log(
          `[MOCK API] Simulating AI response for message ${sentMessage.id}`
        );
        await delay(1000); // Simulate processing time
        const responseId = uuidv4();
        const assistantResponseTimestamp = new Date().toISOString();
        const assistantMessage: ChatMessage = {
          id: responseId,
          role: "assistant",
          content: [
            {
              type: "text",
              value: `This is a simulated response to: "${payload.content[0]?.type === "text" ? (payload.content[0] as any).value.substring(0, 50) + "..." : "your message"}"`,
            },
          ],
          createdAt: assistantResponseTimestamp,
          status: "completed",
          parentId: sentMessage.id, // Link response to the user message
        };
        session.messages.push(assistantMessage);
        session.updatedAt = assistantResponseTimestamp; // Update session timestamp again
        console.log(
          `[MOCK API] Simulated AI response added to session ${sessionId}:`,
          assistantMessage
        );
      }

      // Return a copy of the message the user sent
      return JSON.parse(JSON.stringify(sentMessage));
    },

    async fetchMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
      console.log(
        `[MOCK API] fetchMessagesForSession called for: ${sessionId}`
      );
      await delay(500);

      const session = mockSessions[sessionId];
      if (!session) {
        console.error(`[MOCK API] Session ${sessionId} not found.`);
        throw new Error(`Session with ID ${sessionId} not found`);
      }
      console.log(
        `[MOCK API] Returning ${session.messages.length} messages for session ${sessionId}.`
      );
      // Return copies
      return JSON.parse(JSON.stringify(session.messages));
    },
  };
};

// Determine whether to use real API or mock implementation
// Use `VITE_USE_MOCK_API` or `REACT_APP_USE_MOCK_API` for easier control than NODE_ENV
const useMock =
  process.env.REACT_APP_USE_MOCK_API === "true" ||
  process.env.NODE_ENV === "development";

console.log(
  `API Service: ${useMock ? "Using Mock Implementation" : "Using Real API (" + API_BASE_URL + ")"}`
);

// --- Real API Implementation (using Axios) ---
const realApi = {
  async fetchSessions(): Promise<ChatSession[]> {
    console.log(`[API] GET ${API_BASE_URL}/sessions`);
    const response = await axios.get<ChatSession[]>(`${API_BASE_URL}/sessions`);
    // Ensure messages array exists even if API omits it for empty sessions
    return response.data.map((s) => ({ ...s, messages: s.messages || [] }));
  },

  // Updated signature
  async createSessionAPI(
    sessionData: CreateSessionPayload
  ): Promise<ChatSession> {
    console.log(`[API] POST ${API_BASE_URL}/sessions`, sessionData);
    const response = await axios.post<ChatSession>(
      `${API_BASE_URL}/sessions`,
      sessionData
    );
    // Ensure messages array exists
    response.data.messages = response.data.messages || [];
    return response.data;
  },

  async deleteSessionAPI(sessionId: string): Promise<void> {
    console.log(`[API] DELETE ${API_BASE_URL}/sessions/${sessionId}`);
    await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
  },

  // Updated signature
  async sendMessageAPI(
    sessionId: string,
    payload: SendMessagePayload
  ): Promise<ChatMessage> {
    console.log(
      `[API] POST ${API_BASE_URL}/sessions/${sessionId}/messages`,
      payload
    );
    const response = await axios.post<ChatMessage>(
      `${API_BASE_URL}/sessions/${sessionId}/messages`,
      payload
    );
    // Assuming backend returns the final message object with status:'completed' etc.
    return response.data;
  },

  async fetchMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    console.log(`[API] GET ${API_BASE_URL}/sessions/${sessionId}/messages`);
    const response = await axios.get<ChatMessage[]>(
      `${API_BASE_URL}/sessions/${sessionId}/messages`
    );
    return response.data;
  },
};

// Select implementation based on `useMock`
const api = useMock ? createMockImplementation() : realApi;

export default api;
