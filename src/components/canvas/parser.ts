import { parse as parsePartialJson, ALL } from "partial-json"; // Import partial JSON parser

import type {
  ServerSentEvent,
  ChatMessage,
  ToolResultContent,
  ContentBlock,
  ToolUseContentBlock,
  ToolResultContentBlock,
} from "./types"; // Adjust path
// TODO: have a look at this: https://www.npmjs.com/package/@streamparser/json

// --- Constants for Types ---
const SSE_EVENT_TYPES = {
  MESSAGE_START: "message_start",
  CONTENT_BLOCK_START: "content_block_start",
  CONTENT_BLOCK_DELTA: "content_block_delta",
  CONTENT_BLOCK_STOP: "content_block_stop",
  MESSAGE_DELTA: "message_delta",
  MESSAGE_STOP: "message_stop",
  PING: "ping",
} as const;

const CONTENT_BLOCK_TYPES = {
  TEXT: "text",
  TOOL_USE: "tool_use",
  TOOL_RESULT: "tool_result",
  // Add other potential block types if needed
} as const;

const DELTA_TYPES = {
  TEXT_DELTA: "text_delta",
  INPUT_JSON_DELTA: "input_json_delta",
  // Add other potential delta types if needed
} as const;

// Extract literal types (optional but good practice for clarity)
// type SseEventType = typeof SSE_EVENT_TYPES[keyof typeof SSE_EVENT_TYPES];
// type ContentBlockType = typeof CONTENT_BLOCK_TYPES[keyof typeof CONTENT_BLOCK_TYPES];
// type DeltaType = typeof DELTA_TYPES[keyof typeof DELTA_TYPES];

// Type for partial JSON results
export type PartialJsonValue =
  | string
  | number
  | boolean
  | null
  | PartialJsonObject
  | PartialJsonArray;
export interface PartialJsonObject {
  [key: string]: PartialJsonValue;
}
export type PartialJsonArray = PartialJsonValue[];

// Define callbacks provided by the UI component
export interface ReconstructorCallbacks {
  onMessageUpdate?: (
    message: ChatMessage | null,
    buffers?: Map<number, string>,
    parsedPartialJson?: Map<number, PartialJsonValue> // Use specific type instead of any
  ) => void;
  onMessageComplete?: (message: ChatMessage) => void;
  // onError is now triggered by external connection errors fed into handleSSEError
  // or internal processing errors
  onError?: (error: Error) => void;
}

export interface ReconstructorControls {
  /** Processes a parsed ServerSentEvent from the SSE stream. */
  processSSEEvent: (event: ServerSentEvent) => void;
  /** Signals that the underlying SSE connection was opened. */
  handleSSEOpen: () => void;
  /** Signals that the underlying SSE connection encountered an error. */
  handleSSEError: (error: Error) => void;
  /** Signals that the underlying SSE connection was closed. */
  handleSSEClose: () => void;
  /** Resets the internal message state. */
  resetState: () => void;
  /** Allows updating UI callbacks after initialization. */
  updateCallbacks: (newCallbacks: Partial<ReconstructorCallbacks>) => void;
}

/**
 * Factory function to create a message reconstructor instance.
 * Manages message state based on externally provided Server-Sent Events.
 *
 * @param initialCallbacks Callbacks to update the UI or handle errors.
 * @returns An object with functions to process events and manage state.
 */
export function createMessageReconstructor(
  initialCallbacks: ReconstructorCallbacks = {}
): ReconstructorControls {
  // --- State within Closure ---
  let callbacks = { ...initialCallbacks };
  let isProcessing = false;

  // --- Type for State Tuple ---
  interface ReconstructorState {
    message: ChatMessage | null;
    deltaBuffers: Map<number, string>;
    partialInputStream: Map<number, PartialJsonValue>;
  }

  // --- Initial State ---
  const getInitialState = (): ReconstructorState => ({
    message: null,
    deltaBuffers: new Map(),
    partialInputStream: new Map(),
  });

  let currentState: ReconstructorState = getInitialState();

  // --- Helper: State Reset ---
  const resetStateInternal = () => {
    currentState = getInitialState(); // Reset the single state object
    isProcessing = false;
    // Use current state directly for notification
    callbacks.onMessageUpdate?.(
      currentState.message,
      currentState.deltaBuffers,
      currentState.partialInputStream
    );
  };

  // --- Event Handlers ---

  const handleMessageStart = (
    event: ServerSentEvent & { type: typeof SSE_EVENT_TYPES.MESSAGE_START }
  ): ReconstructorState => {
    const nextMessage: ChatMessage = {
      ...event.message,
      content: event.message.content ?? [],
    };
    // Start with fresh buffers and parsed results for the new message
    return { message: nextMessage, deltaBuffers: new Map(), partialInputStream: new Map() };
  };

  const handleContentBlockStart = (
    currentState: ReconstructorState,
    event: ServerSentEvent & {
      type: typeof SSE_EVENT_TYPES.CONTENT_BLOCK_START;
    }
  ): ReconstructorState => {
    if (!currentState.message) return currentState; // Should not happen if message_start was received

    const { message, deltaBuffers: buffers, partialInputStream: parsedJson } = currentState;
    const newContent = [...(message.content ?? [])];
    newContent[event.index] = { ...event.content_block } as ContentBlock; // Clone block
    const nextMessage = { ...message, content: newContent };
    const nextBuffers = new Map(buffers); // Clone buffers

    // No change to parsedJson map in this handler
    return { message: nextMessage, deltaBuffers: nextBuffers, partialInputStream: parsedJson };
  };

  // --- Helper Functions for Complex Handlers ---

  const updateTextContent = (
    block: ContentBlock & { type: typeof CONTENT_BLOCK_TYPES.TEXT },
    delta: { type: typeof DELTA_TYPES.TEXT_DELTA; text: string },
    currentContent: ContentBlock[]
  ): ContentBlock[] => {
    const updatedBlock = { ...block, text: block.text + delta.text };
    const newContent = [...currentContent];
    newContent[currentContent.indexOf(block)] = updatedBlock; // Assuming block reference is stable or using index
    return newContent;
  };

  const updateJsonBufferAndParse = (
    blockIndex: number,
    delta: { type: typeof DELTA_TYPES.INPUT_JSON_DELTA; partial_json: string },
    currentBuffers: Map<number, string>,
    currentParsedJson: Map<number, PartialJsonValue>
  ): Pick<ReconstructorState, "deltaBuffers" | "partialInputStream"> => {
    const nextBuffers = new Map(currentBuffers);
    const nextParsedJson = new Map(currentParsedJson);
    const currentBuffer = nextBuffers.get(blockIndex) || "";
    const newBuffer = currentBuffer + delta.partial_json;
    nextBuffers.set(blockIndex, newBuffer);

    try {
      const parsedResult = parsePartialJson(newBuffer, ALL);
      nextParsedJson.set(blockIndex, parsedResult);
    } catch (parseError) {
      console.info(
        `updateJsonBufferAndParse: Partial JSON parsing failed for block ${blockIndex}:`,
        parseError
      );
      // Keep the last successful parse result (already in nextParsedJson)
    }
    return { deltaBuffers: nextBuffers, partialInputStream: nextParsedJson };
  };

  const finalizeJsonBlock = (
    blockIndex: number,
    blockToUpdate: ToolUseContentBlock | ToolResultContentBlock,
    currentBuffers: Map<number, string>,
    currentParsedJson: Map<number, PartialJsonValue>
  ): {
    updatedBlock: ContentBlock; // Return the potentially modified block
    deltaBuffers: Map<number, string>;
    partialInputStream: Map<number, PartialJsonValue>;
  } => {
    const nextBuffers = new Map(currentBuffers);
    const nextParsedJson = new Map(currentParsedJson);
    const buffer = nextBuffers.get(blockIndex);
    let finalizedBlock = blockToUpdate; // Start with the input block

    if (buffer === undefined || buffer.trim() === "") {
      // No buffer to process or empty buffer, return state as is and clean up
      nextBuffers.delete(blockIndex);
      nextParsedJson.delete(blockIndex);
      return {
        updatedBlock: finalizedBlock,
        deltaBuffers: nextBuffers,
        partialInputStream: nextParsedJson,
      };
    }

    try {
      const parsedFinalJson = JSON.parse(buffer);
      if (finalizedBlock.type === CONTENT_BLOCK_TYPES.TOOL_USE) {
        // Runtime check: Ensure the parsed JSON is a non-null object before assigning to input
        if (typeof parsedFinalJson === "object" && parsedFinalJson !== null) {
          // Assign if it's an object (Record<string, unknown> or array)
          finalizedBlock = { ...finalizedBlock, input: parsedFinalJson };
        } else {
          console.warn(
            `finalizeJsonBlock: Expected object for tool_use input, but got ${typeof parsedFinalJson}. Block index: ${blockIndex}`
          );
          // Assign empty object {} to satisfy the presumed non-optional Record<string, unknown> type for input.
          // Ideally, the input field in ToolUseContentBlock should be optional.
          finalizedBlock = { ...finalizedBlock, input: {} }; // Assign empty object instead of undefined
        }
      } else if (finalizedBlock.type === CONTENT_BLOCK_TYPES.TOOL_RESULT) {
        // Type assertion is okay here as ToolResultContent can be string | object
        // and the error case handles strings explicitly.
        finalizedBlock = {
          ...finalizedBlock,
          content: parsedFinalJson as ToolResultContent,
          is_error: false,
        };
      }
    } catch (parseError) {
      console.error(
        `finalizeJsonBlock: Failed to parse assembled JSON for block ${blockIndex}:`,
        buffer,
        parseError
      );
      if (finalizedBlock.type === CONTENT_BLOCK_TYPES.TOOL_RESULT) {
        const errorContent = `JSON Parse Error: ${parseError instanceof Error ? parseError.message : String(parseError)}. Raw: ${buffer}`;
        finalizedBlock = {
          ...finalizedBlock,
          content: errorContent,
          is_error: true,
        };
      }
      // TODO: Consider specific error handling for tool_use
    } finally {
      // Clean up buffer and parsed result regardless of success/failure
      nextBuffers.delete(blockIndex);
      nextParsedJson.delete(blockIndex);
    }

    return {
      updatedBlock: finalizedBlock,
      deltaBuffers: nextBuffers,
      partialInputStream: nextParsedJson,
    };
  };

  const handleContentBlockDelta = (
    currentState: ReconstructorState,
    event: ServerSentEvent & {
      type: typeof SSE_EVENT_TYPES.CONTENT_BLOCK_DELTA;
    }
  ): ReconstructorState => {
    const blockIndex = event.index;
    if (!currentState.message?.content?.[blockIndex]) return currentState;

    const { message, deltaBuffers: buffers, partialInputStream: parsedJson } = currentState;
    const block = message.content[blockIndex];
    const delta = event.delta;

    let nextState = currentState; // Start with current state

    if (
      delta.type === DELTA_TYPES.TEXT_DELTA &&
      block.type === CONTENT_BLOCK_TYPES.TEXT
    ) {
      // Ensure the types match for the helper function
      const newContent = updateTextContent(block, delta, message.content);
      nextState = {
        ...currentState,
        message: { ...message, content: newContent },
        // buffers and parsedJson remain unchanged
      };
    } else if (
      delta.type === DELTA_TYPES.INPUT_JSON_DELTA &&
      (block.type === CONTENT_BLOCK_TYPES.TOOL_USE ||
        block.type === CONTENT_BLOCK_TYPES.TOOL_RESULT)
    ) {
      const { deltaBuffers: nextBuffers, partialInputStream: nextParsedJson } =
        updateJsonBufferAndParse(blockIndex, delta, buffers, parsedJson);
      nextState = {
        ...currentState, // Keep message unchanged
        deltaBuffers: nextBuffers,
        partialInputStream: nextParsedJson,
      };
    } else {
      // Log unhandled delta/block type combinations if necessary
      console.warn(
        `Unhandled delta type '${delta.type}' for block type '${block.type}'`
      );
    }

    return nextState;
  };

  const handleContentBlockStop = (
    currentState: ReconstructorState,
    event: ServerSentEvent & { type: typeof SSE_EVENT_TYPES.CONTENT_BLOCK_STOP }
  ): ReconstructorState => {
    const blockIndex = event.index;
    if (!currentState.message?.content?.[blockIndex]) return currentState;

    const { message, deltaBuffers: buffers, partialInputStream: parsedJson } = currentState;
    let blockToUpdate = message.content[blockIndex];

    // Always update timestamp immutably first
    blockToUpdate = { ...blockToUpdate, stop_timestamp: event.stop_timestamp };

    let finalBlock = blockToUpdate; // This will hold the block after potential finalization
    let nextBuffers = buffers;
    let nextParsedJson = parsedJson;

    // Check if the block needs JSON finalization
    if (
      blockToUpdate.type === CONTENT_BLOCK_TYPES.TOOL_USE ||
      blockToUpdate.type === CONTENT_BLOCK_TYPES.TOOL_RESULT
    ) {
      // Delegate finalization - TS narrows blockToUpdate here
      const finalizationResult = finalizeJsonBlock(
        blockIndex,
        blockToUpdate, // Pass the narrowed block
        buffers,
        parsedJson
      );
      finalBlock = finalizationResult.updatedBlock;
      nextBuffers = finalizationResult.deltaBuffers;
      nextParsedJson = finalizationResult.partialInputStream;
    }
    // Else: No finalization needed for this block type (e.g., text)

    // Update the message state with the potentially finalized block
    const newContent = [...message.content].filter((c) => c && c.type);
    newContent[blockIndex] = finalBlock; // Use the finalized block
    const nextMessage = { ...message, content: newContent };

    return {
      message: nextMessage,
      deltaBuffers: nextBuffers,
      partialInputStream: nextParsedJson,
    };
  };

  const handleMessageDelta = (
    currentState: ReconstructorState,
    event: ServerSentEvent & { type: typeof SSE_EVENT_TYPES.MESSAGE_DELTA }
  ): ReconstructorState => {
    if (!currentState.message) return currentState;

    let nextMessage = currentState.message;
    if (event.delta?.stop_reason) {
      nextMessage = { ...nextMessage, finishReason: event.delta.stop_reason };

      // If stop_reason is "error", mark the message status as "failed"
      if (event.delta.stop_reason === "error") {
        nextMessage = { ...nextMessage, status: "failed" as const };
      }
    }
    // Buffers and parsedJson remain unchanged
    return { ...currentState, message: nextMessage };
  };

  const handleMessageStop = (
    currentState: ReconstructorState,
     
    _event: ServerSentEvent & { type: typeof SSE_EVENT_TYPES.MESSAGE_STOP }
  ): ReconstructorState => {
    if (!currentState.message) return currentState;

    const nextMessage = {
      ...currentState.message,
      status: "completed" as const,
    };
    // Buffers and parsedJson remain unchanged, will be passed to callbacks
    return { ...currentState, message: nextMessage };
  };

  const handlePing = (currentState: ReconstructorState): ReconstructorState => {
    return currentState; // No state change
  };

  // --- Central State Calculation Logic ---
  const calculateNextState = (
    currentState: ReconstructorState,
    event: ServerSentEvent
  ): ReconstructorState => {
    // Delegate to the appropriate handler based on the event type
    switch (event.type) {
      case SSE_EVENT_TYPES.MESSAGE_START:
        return handleMessageStart(event);
      case SSE_EVENT_TYPES.CONTENT_BLOCK_START:
        return handleContentBlockStart(currentState, event);
      case SSE_EVENT_TYPES.CONTENT_BLOCK_DELTA:
        return handleContentBlockDelta(currentState, event);
      case SSE_EVENT_TYPES.CONTENT_BLOCK_STOP:
        return handleContentBlockStop(currentState, event);
      case SSE_EVENT_TYPES.MESSAGE_DELTA:
        return handleMessageDelta(currentState, event);
      case SSE_EVENT_TYPES.MESSAGE_STOP:
        return handleMessageStop(currentState, event);
      case SSE_EVENT_TYPES.PING:
        return handlePing(currentState); // Pass current state, handler ignores event details
      default:
        // Handle potentially unknown event types gracefully
        console.warn(`calculateNextState: Unhandled event type received.`);
        return currentState; // Return current state if event type is unknown
    }
  };

  // --- Core Event Processing Function ---
  const processEventAndUpdate = (event: ServerSentEvent): void => {
    if (!isProcessing && event.type !== SSE_EVENT_TYPES.MESSAGE_START) {
      console.warn(
        `Ignoring event ${event.type} received before message_start.`
      );
      return;
    }

    // Reset state for message_start happens inside calculateNextState/handleMessageStart
    if (event.type === SSE_EVENT_TYPES.MESSAGE_START) {
      isProcessing = true;
    }

    try {
      // Store previous state message reference *only* for comparison
      const previousMessageForComparison = currentState.message;

      // Apply the reducer pattern: calculate the next state based on the current state and the event
      const nextState = calculateNextState(currentState, event);

      // Update the single state object
      currentState = nextState;

      // --- Handle Side Effects (Callbacks) based on the *new* currentState ---
      const messageChanged =
        currentState.message !== previousMessageForComparison;

      if (event.type !== SSE_EVENT_TYPES.PING) {
        if (!messageChanged) {
          console.debug(
            `State reference didn't change for event: ${event.type}. Triggering UI update anyway.`
          );
        }
        // Pass the components of the *new* currentState to the callback
        callbacks.onMessageUpdate?.(
          currentState.message,
          currentState.deltaBuffers,
          currentState.partialInputStream
        );
      }

      if (event.type === SSE_EVENT_TYPES.MESSAGE_STOP) {
        if (currentState.message) {
          // Final update call (already done above, ensures latest state is passed)
          callbacks.onMessageUpdate?.(
            currentState.message,
            currentState.deltaBuffers,
            currentState.partialInputStream
          );
          callbacks.onMessageComplete?.(currentState.message); // Pass the final message state
        }
        isProcessing = false;
      }
    } catch (error) {
      console.error("Error during reconstructor event processing:", error);
      callbacks.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
      isProcessing = false;
    }
  };

  // --- Control Functions Exposed to the Caller ---

  /** Processes a parsed ServerSentEvent received from the SSE connection. */
  const processSSEEvent = (event: ServerSentEvent): void => {
    // console.info("Reconstructor received event:", event.type, event); // Enhanced debug log
    processEventAndUpdate(event);
  };

  /** Signals that the underlying SSE connection was successfully opened. */
  const handleSSEOpen = (): void => {
    console.info("SSE Connection Opened. Resetting reconstructor state.");
    resetStateInternal(); // Explicitly reset state on new connection
    // isProcessing is already reset by resetStateInternal
  };

  /** Signals that the underlying SSE connection encountered an error. */
  const handleSSEError = (error: Error): void => {
    console.error("SSE Connection Error reported to reconstructor:", error);
    callbacks.onError?.(error);
    isProcessing = false; // Stop processing on connection error
    // Decide if state should be reset on SSE error. Leaving it for now.
  };

  /** Signals that the underlying SSE connection was closed. */
  const handleSSEClose = (): void => {
    console.info("SSE Connection Closed.");
    // If processing was ongoing and didn't complete via message_stop,
    // consider it incomplete or errored.
    if (isProcessing) {
      console.warn(
        "SSE connection closed mid-stream. Message may be incomplete."
      );
      // Optionally trigger onError or just leave the partial state
      callbacks.onError?.(
        new Error("SSE connection closed unexpectedly mid-stream.")
      );
    }
    // Ensure processing flag is false, even if message_stop wasn't received
    isProcessing = false;
  };

  /** Allows updating UI callbacks after initialization */
  const updateCallbacks = (
    newCallbacks: Partial<ReconstructorCallbacks>
  ): void => {
    callbacks = { ...callbacks, ...newCallbacks };
  };

  // Return the control object
  return {
    processSSEEvent,
    handleSSEOpen,
    handleSSEError,
    handleSSEClose,
    resetState: resetStateInternal,
    updateCallbacks,
  };
}
