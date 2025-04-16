import {
  ChatMessage,
  ChatThread,
  ContentBlock,
  ContextReference,
} from "../types";
// Import PartialJsonValue from the parser file
import { PartialJsonValue } from "../parser";

// Define the connection status type (can be reused from store/index.ts or defined globally)
// NOTE: If defined globally, import it here instead.
type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "streaming"
  | "error"
  | "closed"
  | "completed";

// Define the extended message statuses
export type MessageStatus =
  | "pending" // Optimistic user message, waiting for API
  | "completed" // Message successfully processed/received
  | "error" // Sending failed
  | "streaming"; // Assistant response in progress (optional)

/**
 * State structure for the chat store
 */
export interface ChatStoreState {
  /**
   * Dictionary of chat threads indexed by their IDs
   */
  threads: Record<string, ChatThread>; // Renamed from sessions

  /**
   * ID of the currently active chat thread
   */
  currentThreadId: string | null; // Renamed from currentSessionId

  /**
   * Flag indicating if the store is performing a major initial load
   */
  isLoading: boolean;

  /**
   * Any critical global error related to the store's operation
   */
  error: Error | null;

  // --- New Streaming State --- //
  /** The assistant message currently being reconstructed from the stream. */
  streamingAssistantMessage: ChatMessage | null;
  /** Raw buffers and partially parsed JSON for streaming tool calls/results. */
  streamingToolData: {
    buffers: Map<number, string>;
    parsedJson: PartialJsonValue;
  } | null;
  /** Status of the current SSE connection. */
  connectionStatus: ConnectionStatus;
  /** Error message specifically related to the SSE connection or stream processing. */
  connectionError: string | null;
}

// --- Define API Payload Structures (Example) ---
// These might live elsewhere (e.g., api/types.ts) but are needed for actions

export interface CreateThreadPayload {
  // Renamed from CreateSessionPayload
  title?: string;
  attachedContext?: ContextReference[];
}

export interface SendMessagePayload {
  threadId: string;
  content: ContentBlock[];
  parentId?: string;
  // attachedContext?: ContextReference[]; // If needed by API
}

/**
 * Actions available on the chat store
 */
export interface ChatStoreActions {
  /**
   * Hydrates state from local storage. Creates a new thread if none exists.
   * Should be called once when the app loads.
   */
  initializeStore: () => Promise<void>;

  /**
   * Creates a new chat thread locally with a generated UUID.
   * @param title Optional title for the thread
   * @param context Optional initial context references
   * @returns The created thread
   */
  createThread: (
    title?: string,
    context?: ContextReference[]
  ) => Promise<ChatThread>; // Renamed from createSession

  /**
   * Switches the active thread.
   * @param threadId ID of the thread to switch to
   */
  switchThread: (threadId: string) => void; // Renamed from switchSession

  /**
   * Deletes a chat thread locally only.
   * @param threadId ID of the thread to delete
   */
  deleteThread: (threadId: string) => Promise<void>; // Renamed from deleteSession

  /**
   * Initiates a streaming connection to send a user message and receive the assistant's response.
   * @param messageData Core data for the user message (threadId, content, etc.).
   */
  sendMessage: (messageData: {
    threadId: string;
    content: ContentBlock[]; // Use structured content
    parentId?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;

  /**
   * Manually disconnects the active SSE stream, if one exists.
   */
  disconnectStream: () => void; // New action

  /**
   * Attaches context to a thread locally.
   * @param threadId ID of the thread to attach context to
   * @param context Context reference to attach
   */
  attachContext: (threadId: string, context: ContextReference) => void; // Renamed param

  /**
   * Removes a context reference from a thread locally by its ID.
   * @param threadId ID of the thread
   * @param contextId ID of the context reference to remove
   */
  removeContext: (threadId: string, contextId: string) => void; // Renamed param

  /**
   * Clears the global error state
   */
  clearError: () => void;

  // --- Internal Helpers ---

  /**
   * Internal helper to add a new message or update an existing one by ID.
   * Requires threadId to locate the correct thread.
   * @param message Complete message data (must include threadId)
   */
  _addOrUpdateMessage: (message: ChatMessage) => void;
}

/**
 * Complete chat store type combining state and actions
 */
export type ChatStore = ChatStoreState & ChatStoreActions;
