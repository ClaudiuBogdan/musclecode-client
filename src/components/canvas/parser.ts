import type {
  ServerSentEvent,
  ChatMessage,
  ToolResultContent,
  ContentBlock,
} from "./types"; // Adjust path
import { parse as parsePartialJson, ALL } from "partial-json"; // Import partial JSON parser
// TODO: have a look at this: https://www.npmjs.com/package/@streamparser/json
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
export type ReconstructorCallbacks = {
  onMessageUpdate?: (
    message: ChatMessage | null,
    buffers?: Map<number, string>,
    parsedPartialJson?: Map<number, PartialJsonValue> // Use specific type instead of any
  ) => void;
  onMessageComplete?: (message: ChatMessage) => void;
  // onError is now triggered by external connection errors fed into handleSSEError
  // or internal processing errors
  onError?: (error: Error) => void;
};

// **** NEW Controls API ****
// The controls no longer manage a connection directly, but process events
export type ReconstructorControls = {
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
};

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
  let currentMessageState: ChatMessage | null = null;
  let jsonAssemblyBuffers: Map<number, string> = new Map();
  let parsedPartialJsonResults: Map<number, PartialJsonValue> = new Map(); // Use specific type
  let callbacks = { ...initialCallbacks };
  let isProcessing: boolean = false; // Flag to indicate active message processing

  // --- Helper: State Reset ---
  const resetStateInternal = () => {
    currentMessageState = null;
    jsonAssemblyBuffers = new Map();
    parsedPartialJsonResults = new Map(); // NEW: Reset parsed results
    isProcessing = false;
    // Notify UI that the message state has been reset, pass empty buffers and parsed results
    callbacks.onMessageUpdate?.(null, new Map(), new Map());
  };

  // --- Helper: Calculate Next State (Keep this logic the same) ---
  const calculateNextState = (
    currentState: ChatMessage | null,
    currentBuffers: Map<number, string>, // Receive current buffers
    currentParsedJson: Map<number, PartialJsonValue>, // Use specific type
    event: ServerSentEvent
  ): {
    message: ChatMessage | null;
    buffers: Map<number, string>;
    parsedJson: Map<number, PartialJsonValue>; // Use specific type
  } => {
    // Start with copies to ensure immutability as much as possible
    let nextMessage = currentState ? { ...currentState } : null;
    // !! Crucially, clone the buffer map passed in, don't reuse the closure's map directly
    let nextBuffers = new Map(currentBuffers);
    let nextParsedJson = new Map(currentParsedJson); // NEW: Clone parsed JSON map

    switch (event.type) {
      case "message_start":
        // Ensure content is initialized as empty array
        nextMessage = {
          ...event.message,
          content: event.message.content ?? [],
        };
        nextBuffers = new Map(); // New message, new buffers
        nextParsedJson = new Map(); // NEW: New message, new parsed results
        break;

      case "content_block_start":
        if (nextMessage) {
          // Clone content array for immutability
          const newContent = [...(nextMessage.content ?? [])];
          // Clone the incoming block itself
          newContent[event.index] = { ...event.content_block } as ContentBlock;
          // Update message state with new content array
          nextMessage = { ...nextMessage, content: newContent };

          // Initialize buffer for this block if needed (handled outside, but good practice)
          if (
            event.content_block.type === "tool_use" ||
            event.content_block.type === "tool_result"
          ) {
            // Check if buffer already exists just in case
            if (!nextBuffers.has(event.index)) {
              nextBuffers.set(event.index, "");
            }
          }
        }
        break;

      case "content_block_delta":
        if (nextMessage?.content?.[event.index]) {
          const block = nextMessage.content[event.index]; // Get current block state
          const delta = event.delta;
          let updatedBlock = block; // Assume no change initially

          if (delta.type === "text_delta" && block.type === "text") {
            // Create new block object with appended text
            updatedBlock = { ...block, text: block.text + delta.text };
          } else if (
            delta.type === "input_json_delta" &&
            (block.type === "tool_use" || block.type === "tool_result")
          ) {
            // Update buffer map, not the message state directly for this event
            const currentBuffer = nextBuffers.get(event.index) || "";
            const newBuffer = currentBuffer + delta.partial_json;
            nextBuffers.set(event.index, newBuffer);

            // NEW: Attempt to parse the updated buffer with partial-json
            try {
              const parsedResult = parsePartialJson(newBuffer, ALL);
              nextParsedJson.set(event.index, parsedResult);
            } catch (parseError) {
              console.log(
                `calculateNextState: Partial JSON parsing failed for block ${event.index}:`,
                parseError
              );
              // Keep the previous parsed result if parsing fails
              // This ensures we always show the last successful parse
            }

            // IMPORTANT: Keep block state in nextMessage unchanged here, return updated nextBuffers
          }

          // Only update message state if the block object itself was updated (e.g., for text_delta)
          if (updatedBlock !== block) {
            const newContent = [...nextMessage.content]; // Clone content array
            newContent[event.index] = updatedBlock; // Put updated block in new array
            nextMessage = { ...nextMessage, content: newContent }; // Update message state
          }
        }
        break;

      case "content_block_stop":
        if (nextMessage?.content?.[event.index]) {
          const blockIndex = event.index;
          let blockToUpdate = nextMessage.content[blockIndex]; // Get current block state

          // Always update timestamp immutably
          blockToUpdate = {
            ...blockToUpdate,
            stop_timestamp: event.stop_timestamp,
          };

          // Check if we have a buffer to process for this block index *in the map passed to this function*
          const buffer = nextBuffers.get(blockIndex); // Use nextBuffers map
          if (buffer !== undefined) {
            // Buffer exists for this index
            try {
              const parsedJson = JSON.parse(buffer);
              if (blockToUpdate.type === "tool_use") {
                blockToUpdate = { ...blockToUpdate, input: parsedJson };
              } else if (blockToUpdate.type === "tool_result") {
                blockToUpdate = {
                  ...blockToUpdate,
                  content: parsedJson as ToolResultContent, // Use type assertion
                  is_error: false,
                };
              }
            } catch (parseError) {
              console.error(
                `calculateNextState: Failed to parse assembled JSON for block ${blockIndex}:`,
                buffer,
                parseError
              );
              if (blockToUpdate.type === "tool_result") {
                const errorContent = `JSON Parse Error: ${parseError instanceof Error ? parseError.message : String(parseError)}. Raw: ${buffer}`;
                blockToUpdate = {
                  ...blockToUpdate,
                  content: errorContent,
                  is_error: true,
                };
              }
              // Handle tool_use error if needed
            } finally {
              // Clean up buffer for this index *in the map we are returning*
              nextBuffers.delete(blockIndex); // Modify the map copy
              nextParsedJson.delete(blockIndex); // NEW: Clean up parsed result as well
            }
          } // else: no buffer needed processing for this block

          // Update the message state with the (potentially) processed block
          const newContent = [...nextMessage.content];
          newContent[blockIndex] = blockToUpdate;
          nextMessage = { ...nextMessage, content: newContent };
        }
        break;

      case "message_delta":
        if (nextMessage) {
          if (event.delta?.stop_reason) {
            nextMessage = {
              ...nextMessage,
              finishReason: event.delta.stop_reason,
            };
          }
        }
        break;

      case "message_stop":
        if (nextMessage) {
          nextMessage = { ...nextMessage, status: "completed" };
        }
        break;

      case "ping":
        // No state change needed
        console.log("calculateNextState: ping ignored"); // Log
        break;
    }

    // Return the potentially modified message state, buffers, and parsed JSON results
    return {
      message: nextMessage,
      buffers: nextBuffers,
      parsedJson: nextParsedJson,
    };
  };

  // --- Core Event Processing Function (Called by processSSEEvent) ---
  const processEventAndUpdate = (event: ServerSentEvent): void => {
    // ... (ignore events before message_start logic) ...
    if (event.type === "message_start") {
      isProcessing = true;
    }

    try {
      // Store previous state reference for comparison
      const previousMessageStateForComparison = currentMessageState;

      // Calculate the next state immutably, passing the CURRENT states
      const nextState = calculateNextState(
        currentMessageState,
        jsonAssemblyBuffers, // Pass the closure's current buffer state
        parsedPartialJsonResults, // NEW: Pass current parsed results
        event
      );

      // Update the closure's state variables using the results returned by calculateNextState
      currentMessageState = nextState.message;
      jsonAssemblyBuffers = nextState.buffers; // **** CRUCIAL: Update closure buffers ****
      parsedPartialJsonResults = nextState.parsedJson; // NEW: Update parsed results

      // --- Handle Side Effects Based on Event AFTER State Update ---
      // Pass the current buffer state and parsed results along with the message state
      if (
        event.type !== "ping" &&
        currentMessageState !== previousMessageStateForComparison
      ) {
        // Pass the UPDATED jsonAssemblyBuffers and parsedPartialJsonResults maps to the callback
        callbacks.onMessageUpdate?.(
          currentMessageState,
          jsonAssemblyBuffers,
          parsedPartialJsonResults
        );
      } else if (event.type !== "ping") {
        console.debug(
          `State reference didn't change for event: ${event.type}. No UI update triggered by default.`
        );
        // Still pass buffers and parsed results even if message ref didn't change
        callbacks.onMessageUpdate?.(
          currentMessageState,
          jsonAssemblyBuffers,
          parsedPartialJsonResults
        );
      }

      // Handle message completion
      if (event.type === "message_stop") {
        // ... (message_stop logic - KEEP THIS) ...
        if (currentMessageState) {
          // Pass final message state, potentially empty buffers, and parsed results
          callbacks.onMessageUpdate?.(
            currentMessageState,
            jsonAssemblyBuffers,
            parsedPartialJsonResults
          );
          callbacks.onMessageComplete?.(currentMessageState);
        }
        isProcessing = false;
      }
    } catch (error) {
      // ... (error handling - KEEP THIS) ...
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
    // console.log("Reconstructor received event:", event.type); // Debug log
    processEventAndUpdate(event);
  };

  /** Signals that the underlying SSE connection was successfully opened. */
  const handleSSEOpen = (): void => {
    // Reset state when a new connection opens to prepare for a new message stream
    resetStateInternal();
    isProcessing = false; // Ensure processing flag is reset
  };

  /** Signals that the underlying SSE connection encountered an error. */
  const handleSSEError = (error: Error): void => {
    callbacks.onError?.(error);
    isProcessing = false; // Stop processing on connection error
  };

  /** Signals that the underlying SSE connection was closed. */
  const handleSSEClose = (): void => {
    // If processing was ongoing and didn't complete via message_stop,
    // consider it incomplete or errored.
    if (isProcessing) {
      console.warn(
        "SSE connection closed mid-stream. Message may be incomplete."
      );
      // Optionally trigger onError or reset state
      // callbacks.onError?.(new Error("SSE connection closed unexpectedly mid-stream."));
      // resetStateInternal(); // Or just leave the partial state
    }
    isProcessing = false;
  };

  /** Allows updating UI callbacks after initialization */
  const updateCallbacks = (
    newCallbacks: Partial<ReconstructorCallbacks>
  ): void => {
    callbacks = { ...callbacks, ...newCallbacks };
  };

  // Return the control object with the new API
  return {
    processSSEEvent,
    handleSSEOpen,
    handleSSEError,
    handleSSEClose,
    resetState: resetStateInternal,
    updateCallbacks,
  };
}
