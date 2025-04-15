# Message Reconstructor Specification (`parser.ts`)

## 1. Overview

The `parser.ts` module provides a factory function, `createMessageReconstructor`, designed to process a stream of Server-Sent Events (SSE) representing parts of a potentially complex chat message (including text, tool usage, and tool results). Its primary goal is to reconstruct the complete message state incrementally and provide updates to the UI via callbacks as the message builds.

It decouples the message reconstruction logic from the actual SSE connection management, allowing external code to handle the connection lifecycle and feed events into the reconstructor.

## 2. Core Concepts

*   **Server-Sent Events (SSE):** The reconstructor consumes events conforming to a specific protocol (defined partially in `types.ts`), where a single logical message is broken down into multiple events like `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, and `message_stop`.
*   **Message Reconstruction:** It assembles the final message object (`ChatMessage`) by processing these events sequentially. Special handling is included for assembling potentially chunked JSON data within tool usage (`tool_use`) and tool result (`tool_result`) content blocks.
*   **State Management:**
    *   **Single State Object:** The reconstructor maintains its internal state within a single object (`currentState`) defined by the `ReconstructorState` type (`{ message: ChatMessage | null, buffers: Map<number, string>, parsedJson: Map<number, PartialJsonValue> }`).
    *   **Reducer Pattern:** State transitions are handled primarily by the `calculateNextState` function, which acts as a pure function (reducer). It takes the `currentState` and an incoming `ServerSentEvent` and returns the `nextState`. The core `processEventAndUpdate` function orchestrates this: `currentState = calculateNextState(currentState, event)`.
    *   **Immutability:** State updates strive for immutability. New state objects (or parts of the state like `message.content` arrays) are created rather than modifying existing ones directly where feasible. Maps (`buffers`, `parsedJson`) are cloned before modification within handlers that change them.
*   **Partial JSON Parsing:** For `input_json_delta` events within tool blocks, the reconstructor uses the `partial-json` library to attempt parsing the incomplete JSON stream. This allows the UI to potentially display a preview of the JSON structure as it arrives. The last successfully parsed *partial* JSON for each block is stored in the `parsedJson` map.
*   **Final JSON Parsing:** When a `content_block_stop` event arrives for a tool block, the reconstructor attempts a final `JSON.parse()` on the fully assembled buffer for that block. The result is stored in the `input` (for `tool_use`) or `content` (for `tool_result`) field of the corresponding `ContentBlock` in the `message` state. Buffer/parsed partial JSON cleanup occurs here.

## 3. Exports

*   `createMessageReconstructor`: The main factory function.
*   `ReconstructorCallbacks`: Type definition for the callbacks provided by the UI.
*   `ReconstructorControls`: Type definition for the control object returned by the factory.
*   `PartialJsonValue`, `PartialJsonObject`, `PartialJsonArray`: Types related to partial JSON parsing results.

## 4. `createMessageReconstructor(initialCallbacks)`

*   **Purpose:** Creates and returns a new message reconstructor instance with its own isolated state.
*   **Parameters:**
    *   `initialCallbacks: ReconstructorCallbacks = {}`: An optional object containing callback functions (`onMessageUpdate`, `onMessageComplete`, `onError`) to be invoked by the reconstructor.
*   **Returns:** `ReconstructorControls`: An object containing functions to interact with the reconstructor.

## 5. Internal State (`ReconstructorState`)

The state managed within the closure of `createMessageReconstructor`:

*   `message: ChatMessage | null`: The currently reconstructed message object. It's built incrementally based on events. `null` before `message_start` or after `resetState`.
*   `buffers: Map<number, string>`: A map where keys are content block indices and values are the raw, accumulated strings for blocks that receive chunked JSON data (`tool_use`, `tool_result` via `input_json_delta`). Buffers are deleted upon successful or failed final parsing in `content_block_stop`.
*   `parsedJson: Map<number, PartialJsonValue>`: A map storing the *latest successfully parsed partial JSON* for blocks receiving `input_json_delta`. This allows rendering intermediate states. Cleared alongside `buffers` during `content_block_stop` finalization.

## 6. `ReconstructorControls` API

The object returned by `createMessageReconstructor` provides the following control functions:

*   **`processSSEEvent(event: ServerSentEvent): void`**
    *   The primary method for feeding events into the reconstructor.
    *   Ignores events before `message_start` (except `message_start` itself).
    *   Sets an internal `isProcessing` flag upon `message_start`.
    *   Calls `calculateNextState` to determine the next state based on the current state and the event.
    *   Updates the internal `currentState`.
    *   Triggers `onMessageUpdate` if the event type is not `ping`.
    *   Triggers `onMessageComplete` if the event type is `message_stop`.
    *   Clears the `isProcessing` flag upon `message_stop` or if an internal error occurs during processing.
    *   Catches internal processing errors and triggers `onError`.
*   **`handleSSEOpen(): void`**
    *   Signals that the underlying SSE connection (managed externally) has been opened.
    *   Resets the reconstructor's internal state via `resetStateInternal()`, preparing it for a potentially new message stream.
*   **`handleSSEError(error: Error): void`**
    *   Signals that the underlying SSE connection encountered an error.
    *   Triggers the `onError` callback with the provided error.
    *   Sets the internal `isProcessing` flag to `false`.
*   **`handleSSEClose(): void`**
    *   Signals that the underlying SSE connection was closed.
    *   Sets the internal `isProcessing` flag to `false`.
    *   Logs a warning if the connection closed while `isProcessing` was `true` (i.e., before a `message_stop` event was received).
*   **`resetState(): void`**
    *   Manually resets the reconstructor's internal state to its initial values (`message: null`, empty maps).
    *   Sets `isProcessing` to `false`.
    *   Triggers `onMessageUpdate` with the reset state (`null`, empty maps).
*   **`updateCallbacks(newCallbacks: Partial<ReconstructorCallbacks>): void`**
    *   Allows updating the callback functions (`onMessageUpdate`, `onMessageComplete`, `onError`) after the reconstructor has been initialized. Merges new callbacks with existing ones.

## 7. Event Processing Logic (`calculateNextState` & Handlers)

*   **Delegation:** `calculateNextState` acts as a dispatcher, routing the event and current state to specific handler functions based on `event.type` (e.g., `handleMessageStart`, `handleContentBlockDelta`).
*   **Constants:** Uses constants (`SSE_EVENT_TYPES`, `CONTENT_BLOCK_TYPES`, `DELTA_TYPES`) for type checking and logic branching.
*   **`message_start`:** Initializes the `message` state and clears `buffers` and `parsedJson`.
*   **`content_block_start`:** Adds a new, empty content block to the `message.content` array. Initializes an empty buffer in `buffers` if the block type is `tool_use` or `tool_result`.
*   **`content_block_delta`:**
    *   Delegates to `updateTextContent` for `text_delta` on `text` blocks (appends text).
    *   Delegates to `updateJsonBufferAndParse` for `input_json_delta` on `tool_use`/`tool_result` blocks (appends to buffer, attempts partial parse, updates `parsedJson` map).
*   **`content_block_stop`:**
    *   Updates the `stop_timestamp` on the block.
    *   If the block is `tool_use` or `tool_result`, delegates to `finalizeJsonBlock`.
        *   `finalizeJsonBlock` attempts `JSON.parse()` on the corresponding buffer.
        *   Updates the block's `input` or `content`/`is_error` field based on parsing success/failure.
        *   Handles cases where the parsed JSON for `tool_use` input isn't an object.
        *   Deletes the corresponding entries from `buffers` and `parsedJson`.
    *   Updates the block in the `message.content` array.
*   **`message_delta`:** Updates message-level properties like `finishReason`.
*   **`message_stop`:** Sets the message `status` to `completed`. Triggers `onMessageComplete` via `processEventAndUpdate`.
*   **`ping`:** Ignored, state remains unchanged.

## 8. Callbacks (`ReconstructorCallbacks`)

*   **`onMessageUpdate(message, buffers, parsedJson)`:**
    *   Called after *any* state change resulting from `processSSEEvent` (except for `ping` events).
    *   Provides the *current* state:
        *   `message: ChatMessage | null`: The latest reconstructed message object.
        *   `buffers: Map<number, string>`: The current state of JSON assembly buffers.
        *   `parsedJson: Map<number, PartialJsonValue>`: The current state of partially parsed JSON results.
    *   Also called by `resetState` with the initial state values.
*   **`onMessageComplete(message: ChatMessage)`:**
    *   Called only when a `message_stop` event is processed successfully via `processSSEEvent`.
    *   Provides the final, completed `ChatMessage` object.
*   **`onError(error: Error)`:**
    *   Called when:
        *   An internal error occurs during event processing within `processEventAndUpdate`.
        *   `handleSSEError` is called (signaling an external connection error).

## 9. Assumptions & Design Choices

*   **External Connection Management:** The reconstructor does *not* manage the SSE connection itself. It relies on external code to establish, maintain, and handle errors/closure of the connection, feeding events and lifecycle signals via the `ReconstructorControls`.
*   **Immutability Focus:** State updates prefer creating new objects/arrays over direct mutation to simplify reasoning and potentially integrate better with UI frameworks.
*   **Partial JSON Previews:** Leverages `partial-json` to provide potentially useful intermediate states for streaming JSON, stored separately from the final parsed JSON in the message content.
*   **Error Handling:** Internal parsing errors during `content_block_stop` are generally caught, logged, and reflected in the `tool_result` block's `content`/`is_error` fields. Connection errors are passed through via `onError`. 