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

/**
 * Represents the status of an action or plan step.
 */
export type ActionStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "skipped";

// --------------- Base Content Element ---------------

/**
 * Base interface for any distinct piece of content within a message.
 * Uses a 'type' discriminator for specific rendering and processing.
 */
export interface BaseContentElement {
  /** The discriminator field to identify the element type. */
  type: string;
  /** Optional unique ID for this specific content element instance, useful for updates or referencing. */
  id?: string;
}

// --------------- Content Element Types ---------------
// Discriminated union of all possible content elements within a message body.

export type ContentElement =
  | TextElement
  | CodeElement
  | ImageElement
  | FileElement
  | ActionRequestElement
  | ActionStatusElement
  | ActionResultElement
  | ReferenceElement
  | UIControlElement
  | StatusUpdateElement
  | ErrorElement
  | InteractionResponseElement
  | CustomElement;

/**
 * Plain text content. Supports markdown rendering on the frontend.
 */
export interface TextElement extends BaseContentElement {
  type: "text";
  /** The text content. */
  value: string;
}

/**
 * Code block content.
 */
export interface CodeElement extends BaseContentElement {
  type: "code";
  /** The code content. */
  value: string;
  /** Optional language identifier for syntax highlighting (e.g., 'typescript', 'python'). */
  language?: string;
}

/**
 * Image content.
 */
export interface ImageElement extends BaseContentElement {
  type: "image";
  /** URL of the image file. */
  url: string;
  /** Alt text for accessibility and description. */
  alt?: string;
}

/**
 * Reference to an uploaded or external file.
 */
export interface FileElement extends BaseContentElement {
  type: "file";
  /** Display name of the file. */
  name: string;
  /** URL to download/view the file (if applicable). */
  url?: string;
  /** MIME type (e.g., 'application/pdf', 'image/png'). */
  mimeType?: string;
  /** Size in bytes. */
  size?: number;
  /** Internal reference ID if needed for backend correlation. */
  refId?: string;
}

// --- Elements for Actions/Tools ---

/**
 * Represents a request for an action or tool execution initiated by the assistant.
 */
export interface ActionRequestElement extends BaseContentElement {
  type: "action_request";
  /** Name of the tool/action being called. */
  toolName: string;
  /** Arguments passed to the tool (should be JSON-serializable). */
  args: Record<string, unknown>;
  /** Unique ID for this specific tool call instance, used to link status and result. */
  callId: string;
}

/**
 * Represents the status update of an ongoing action.
 * Allows showing intermediate steps or progress.
 */
export interface ActionStatusElement extends BaseContentElement {
  type: "action_status";
  /** Links this status update to the corresponding ActionRequestElement. */
  callId: string;
  /** The current status of the action execution. */
  status: ActionStatus;
  /** Optional status message (e.g., "Fetching data...", "Processing complete", "API limit reached"). */
  message?: string;
  /** Optional progress indicator (e.g., 0-1 or 0-100). */
  progress?: number;
}

/**
 * Represents the result returned by an action or tool.
 */
export interface ActionResultElement extends BaseContentElement {
  type: "action_result";
  /** Links this result to the corresponding ActionRequestElement. */
  callId: string;
  /** The raw result data returned by the tool (should be JSON-serializable). */
  result: unknown;
  /** Optional: Pre-rendered representation of the result using other ContentElements for direct display. */
  renderedResult?: ContentElement[];
  /** Indicates if the action execution that produced this result was successful or failed. */
  status: "success" | "error";
  /** Optional error message if status is 'error'. */
  errorMessage?: string;
}

/**
 * Represents a source or context reference used by the AI (e.g., citation).
 */
export interface ReferenceElement extends BaseContentElement {
  type: "reference";
  /** Name or identifier of the source (e.g., filename, URL, document title). */
  source: string;
  /** Relevant snippet/quote from the source content. */
  snippet?: string;
  /** Direct link to the source if available. */
  url?: string;
  /** Internal reference ID if needed. */
  refId?: string;
}

// --- Interactive UI Elements ---

/**
 * Represents an interactive UI control rendered within the chat message,
 * intended for the user to interact with.
 */
export interface UIControlElement extends BaseContentElement {
  type: "ui_control";
  /** The type of UI control to render. */
  controlType: "button" | "input" | "select" | "checkbox" | "textarea";
  /** Display label (e.g., button text, input placeholder). */
  label: string;
  /** Identifier for the action this control triggers when interacted with. Sent back in InteractionResponseElement. */
  actionId: string;
  /** Optional data associated with the control or action, sent back in InteractionResponseElement. */
  payload?: unknown;
  /** Default value for inputs/selects/textareas. */
  defaultValue?: unknown;
  /** Options for 'select' controlType. */
  options?: { label: string; value: string }[];
  /** Whether the control is currently interactive. */
  disabled?: boolean;
}

// --- Informational Elements ---

/**
 * Simple status message embedded within content, not tied to a specific action callId.
 * Useful for general feedback or warnings.
 */
export interface StatusUpdateElement extends BaseContentElement {
  type: "status_update";
  message: string;
  level: "info" | "warning" | "error" | "debug"; // Severity level
}

/**
 * Represents a structured error message within the content flow.
 */
export interface ErrorElement extends BaseContentElement {
  type: "error";
  /** User-friendly error message. */
  message: string;
  /** Optional error code (application-specific or HTTP status). */
  code?: string | number;
  /** Optional technical details, stack trace, etc. (use with caution regarding info exposure). */
  details?: string;
  /** Indicates if this error likely halted the intended operation. */
  fatal?: boolean;
}

/**
 * Represents the user's interaction with a UIControlElement, sent as part of a new user message.
 */
export interface InteractionResponseElement extends BaseContentElement {
  type: "interaction_response";
  /** Optional: ID of the specific UIControlElement instance that was interacted with. */
  controlId?: string;
  /** The action identifier from the UIControlElement that was triggered. */
  actionId: string;
  /** Payload from the UIControlElement or data entered/selected by the user. */
  payload?: unknown;
  /** Optional: User-facing label of the control interacted with (e.g., button text). Helps interpret the interaction. */
  label?: string;
}

// --- Extensibility ---

/**
 * Extensibility point for custom application-specific content elements.
 * Use a unique `customType` to differentiate between various custom elements.
 */
export interface CustomElement extends BaseContentElement {
  type: "custom";
  /** Specific identifier for your custom element type. */
  customType: string;
  /** Custom data structure needed to render this element. */
  data: Record<string, unknown>;
}

// --------------- Context Reference Types ---------------
/**
 * Base interface for any distinct piece of context attached to a message.
 * Uses a 'type' discriminator for specific processing.
 */
export interface BaseContextElement {
  /** Unique ID for this specific context element instance. */
  id: string;
  /** The discriminator field to identify the context element type. */
  type: string;
  /** Whether this context element can be used multiple times in the same message. */
  unique?: boolean;
}

/**
 * Represents a reference to a prompt provided as context.
 */
export interface PromptReferenceContext extends BaseContextElement {
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
export interface CanvasContext extends BaseContextElement {
  type: "canvas";
  canvas: {
    id: string;
    name: string;
    description: string;
  };
}

/**
 * Represents a key-value pair provided as context.
 */
export interface KeyValueContextElement extends BaseContextElement {
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
  | CanvasContext
  | KeyValueContextElement;

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
  content: ContentElement[];

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
  threadId?: string;
  /** Optional ID linking the message to a specific agent/tool execution run. */
  runId?: string;

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
 * Represents the entire chat session or conversation.
 */
export interface ChatSession {
  /** Unique identifier for the chat session. */
  id: string;
  /** Optional title for the chat session. */
  title?: string;
  /** Timestamp of session creation (recommend ISO 8601 format string). */
  createdAt: string;
  /** Timestamp of the last session update (recommend ISO 8601 format string). */
  updatedAt: string;
  /** Ordered list of messages constituting the conversation. */
  messages: ChatMessage[];
  /** Metadata associated with the entire session (e.g., user ID, session settings). */
  metadata?: Record<string, unknown>;
  /** Context references attached to the session. */
  attachedContext?: ContextReference[];
  /** Timestamp of the last message sync with the backend. */
  lastMessagesSyncAt?: string;
}
