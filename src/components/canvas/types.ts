/**
 * Represents the author role in the chat.
 * - user: End-user interacting with the agent.
 * - assistant: The AI agent.
 * - system: Configuration messages or instructions (often hidden).
 * - tool: Messages representing tool calls or results (can also be part of 'assistant' message content).
 */
export type ChatRole = "user" | "assistant" | "system" | "tool";

/**
 * Represents the overall status of a potentially multi-step message generation or processing.
 */
export type MessageStatus =
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

// --------------- Base Content Block ---------------

/**
 * Base interface for any distinct piece of content within a message.
 * Uses a 'type' discriminator for specific rendering and processing.
 */
export interface BaseContentBlock {
  /** The discriminator field to identify the block type. */
  type: string;
  /** Optional unique ID for this specific content block instance, useful for updates or referencing. */
  id?: string;
}

// --------------- Content Block Types ---------------
// Discriminated union of all possible content blocks within a message body.

export type ContentBlock = TextBlock;

/**
 * Plain text content. Supports markdown rendering on the frontend.
 */
export interface TextBlock extends BaseContentBlock {
  type: "text";
  /** The text content. */
  text: string;
}

// --------------- Context Reference Types ---------------
/**
 * Base interface for any distinct piece of context attached to a message.
 * Uses a 'type' discriminator for specific processing.
 */
export interface BaseContextBlock {
  /** Unique ID for this specific context block instance. */
  id: string;
  /** The discriminator field to identify the context block type. */
  type: string;
  /** Whether this context block can be used multiple times in the same message. */
  unique?: boolean;
}

/**
 * Represents a reference to a prompt provided as context.
 */
export interface PromptReferenceContext extends BaseContextBlock {
  type: "prompt";
  prompt: {
    id: string;
    name: string;
    description: string;
  };
  unique: true;
}

/**
 * Represents a reference to a canvas provided as context.
 */
export interface GraphNodeContext extends BaseContextBlock {
  type: "graph_node";
  graph_node: {
    id: string;
  };
}

/**
 * Represents a key-value pair provided as context.
 */
export interface KeyValueContextBlock extends BaseContextBlock {
  type: "key_value";
  title: string;
  key_value: {
    key: string;
    value: string;
    options?: string[];
    customValue?: boolean;
    description?: string;
    unique?: boolean;
  };
}

export type ContextReference =
  | PromptReferenceContext
  | GraphNodeContext
  | KeyValueContextBlock;

// --------------- Chat Message ---------------

/**
 * Represents a single message within the chat conversation.
 */
export interface ChatMessage {
  /** Unique identifier for the message. */
  id: string;
  /** Timestamp of message creation (recommend ISO 8601 format string for serialization). */
  createdAt: string;
  /** Who sent the message. */
  role: ChatRole;
  /**
   * The structured content of the message. Always an array for rendering consistency.
   * Simple text messages should be represented as `[{ type: 'text', value: '...' }]`.
   */
  content: ContentBlock[];

  /**
   * References to external context items (like prompts or canvases) relevant to this message.
   * Useful for tracking information sources or augmenting LLM context.
   */
  attachedContext?: ContextReference[];

  /** Overall status, useful for async assistant messages that might involve multiple steps. */
  status?: MessageStatus;
  /** ID of the message this one is related to (e.g., a tool result message replying to a tool call message, or user interaction replying to assistant message). */
  parentId?: string;
  /** Optional ID for grouping related messages in a logical sub-thread or step (e.g., all messages related to one complex agent task). */
  threadId: string;

  // --- Standardized Optional Metadata ---
  /** End-to-end latency in milliseconds for generating the message (if applicable, e.g., for 'assistant' role). */
  latencyMs?: number;
  /** Token usage information for the LLM call that generated this message (if applicable). */
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  /** Reason the message generation finished (e.g., 'stop' sequence, max length reached, tool calls needed). */
  finishReason?:
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter"
    | "error"
    | null;

  // --- Custom Metadata ---
  /** Generic property bag for any additional custom data associated with the message. */
  metadata?: Record<string, unknown>;
}

// --------------- Chat Container ---------------
/**
 * Represents a single chat conversation/thread.
 */
export interface ChatThread {
  /** Unique identifier for the session */
  id: string;
  /** Optional title for the chat session. */
  title?: string;
  /** Timestamp of session creation (recommend ISO 8601 format string). */
  createdAt: string;
  /** Timestamp of the last session update (recommend ISO 8601 format string). */
  updatedAt: string;
  /** Ordered list of messages constituting the conversation. */
  messages: ChatMessage[];
  /** Context references attached to the session. */
  attachedContext?: ContextReference[];
  /** Timestamp of the last message sync with the backend. */
  lastMessagesSyncAt?: string;
}