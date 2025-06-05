import { useState, useRef, useEffect, useCallback } from "react";

import { env } from "@/config/env";
import { listenToSSE } from "@/lib/api/client"; // Adjust path if needed
import { AuthError } from "@/lib/auth/errors"; // Adjust path if needed
import { AppError } from "@/lib/errors/types"; // Adjust path if needed

import { createMessageReconstructor } from "../parser";

import type {
  PartialJsonValue,
  ReconstructorControls,
} from "../parser";
import type {
  ChatMessage,
  ContentBlock,
  ServerSentEvent, // Ensure this is imported if used directly (e.g., in types)
} from "../types"; // Adjust path if needed

// **** Import the SSE listener ****



import type { SSEController, SSECallbacks } from "@/lib/api/client";


// Define the type for the component's status
type ConnectionStatus =
  | "idle"
  | "connecting" // Initial call to listenToSSE
  | "open" // SSE connection successful
  | "streaming" // Receiving messages via reconstructor
  | "error"
  | "closed" // Closed cleanly by server or disconnect()
  | "completed"; // Message reconstruction complete (via message_stop)

function StreamingChatDisplay() {
  // State for the message being managed by the reconstructor
  // The UI will update based on this state variable when the reconstructor calls onMessageUpdate
  const [message, setMessage] = useState<ChatMessage | null>(null);
  // **** State for both raw JSON buffers and parsed partial JSON values ****
  const [buffers, setBuffers] = useState<Map<number, string>>(new Map());
  const [parsedJsonResults, setParsedJsonResults] = useState<
    Map<number, PartialJsonValue>
  >(new Map());

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Ref for the modified reconstructor controls (manages message state)
  const reconstructorRef = useRef<ReconstructorControls | null>(null);
  // Ref for the SSE connection controller (manages network connection)
  const sseControllerRef = useRef<SSEController | null>(null);

  // Endpoint URL (update if your backend runs elsewhere)
  const streamUrl = `${env.VITE_API_URL}/api/v1/chat/messages/stream-complex`;

  // --- Callbacks for the Reconstructor (Passed during initialization) ---
  // These update the component's UI state (`message`, `status`, `error`)

  const handleMessageUpdate = useCallback(
    // Accept parsed JSON results from parser
    (
      updatedMessage: ChatMessage | null,
      updatedBuffers?: Map<number, string>,
      updatedParsedJson?: Map<number, PartialJsonValue>
    ) => {
      setMessage(updatedMessage); // Update the message state

      // **** Update buffer and parsed JSON states ****
      if (updatedBuffers) {
        setBuffers(new Map(updatedBuffers)); // Store a copy of the buffers map
      }

      if (updatedParsedJson) {
        setParsedJsonResults(new Map(updatedParsedJson)); // Store a copy of the parsed JSON map
      }

      // Reset both if message is reset
      if (!updatedMessage) {
        setBuffers(new Map());
        setParsedJsonResults(new Map());
      }

      if (updatedMessage && status !== "completed") {
        setStatus(
          (prev) =>
            prev === "open" || prev === "streaming" ? "streaming" : prev // Keep streaming status
        );
      }
    },
    [status] // Depend on status to avoid stale closures if logic used it heavily
  );

  const handleMessageComplete = useCallback((finalMessage: ChatMessage) => {
    setMessage(finalMessage); // Ensure final state is set for rendering
    setStatus("completed"); // Set final UI status
  }, []);

  const handleReconstructorError = useCallback((err: Error) => {
    // Handles errors originating *within* the reconstructor's processing logic
    console.error("COMPONENT handleReconstructorError CALLED:", err);
    setError(`Reconstruction Error: ${err.message}`);
    setStatus("error");
  }, []);

  // --- Initialize Reconstructor on Mount ---
  useEffect(() => {
    // Ensure it only runs once
    reconstructorRef.current ??= createMessageReconstructor({
        onMessageUpdate: handleMessageUpdate,
        onMessageComplete: handleMessageComplete,
        onError: handleReconstructorError,
    });
    // No cleanup needed specifically for the reconstructor instance itself here
  }, [handleMessageUpdate, handleMessageComplete, handleReconstructorError]); // Stable callbacks

  // --- Callbacks for listenToSSE (Feed events TO the reconstructor) ---

  const handleSSEOpen = useCallback(() => {
    setStatus("open");
    setError(null);
    // Notify reconstructor that connection is open (will trigger its reset)
    reconstructorRef.current?.handleSSEOpen();
  }, []); // Depends only on reconstructorRef

  const handleSSEMessage = useCallback((eventData: ServerSentEvent) => {
    // Assuming eventData is a parsed ServerSentEvent from listenToSSE
    if (
      typeof eventData === "object" &&
      eventData !== null &&
      "type" in eventData
    ) {
      // Feed the event to the reconstructor for state processing
      reconstructorRef.current?.processSSEEvent(eventData);
    } else {
      console.warn(
        "Received unexpected non-event data format from listenToSSE:",
        eventData
      );
      // Notify reconstructor about the bad data
      reconstructorRef.current?.handleSSEError(
        new Error(`Received unexpected data format: ${typeof eventData}`)
      );
    }
  }, []); // Depends only on reconstructorRef

  const handleSSEError = useCallback((err: Error) => {
    // Handles errors from the underlying SSE network connection itself
    console.error("COMPONENT handleSSEError CALLED (via listenToSSE):", err);
    const errorMessage =
      err instanceof AppError ? `${err.name}: ${err.message}` : err.message;
    setError(errorMessage);
    setStatus("error");
    // Notify the reconstructor about the connection error
    reconstructorRef.current?.handleSSEError(err);
    sseControllerRef.current = null; // Clear SSE controller ref
  }, []); // Depends only on reconstructorRef

  const handleSSEClose = useCallback(() => {
    setStatus((prevStatus) =>
      prevStatus === "error" || prevStatus === "completed"
        ? prevStatus
        : "closed"
    );
    // Notify the reconstructor about the connection closing
    reconstructorRef.current?.handleSSEClose();
    sseControllerRef.current = null; // Clear SSE controller ref
  }, []); // Depends only on reconstructorRef

  // --- Effect for SSE Connection Cleanup ---
  useEffect(() => {
    // Return cleanup function to disconnect on unmount
    return () => {
      if (sseControllerRef.current) {
        sseControllerRef.current.disconnect();
        sseControllerRef.current = null;
      }
    };
  }, []); // Empty dependency array: runs only on mount/unmount

  // --- Connection Handlers ---

  const connectStream = () => {
    // Prevent multiple concurrent connection attempts
    if (
      sseControllerRef.current ||
      status === "connecting" ||
      status === "open" ||
      status === "streaming"
    ) {
      console.warn(
        "Connection already active or connection attempt in progress."
      );
      return;
    }

    setStatus("connecting");
    setError(null);
    setMessage(null); // Clear previous UI message state
    setBuffers(new Map()); // **** Clear buffers state on new connection ****
    setParsedJsonResults(new Map()); // **** Clear parsed JSON results on new connection ****
    reconstructorRef.current?.resetState(); // Reset reconstructor's internal state

    // Prepare payload for the POST request (if needed by backend to trigger stream)
    const triggerPayload = {
      messageId: `client-${Date.now()}`,
      threadId: "thread-123", // Example
    };

    try {
      // Define the set of callbacks for listenToSSE
      const callbacks: SSECallbacks = {
        onOpen: handleSSEOpen,
        onMessage: handleSSEMessage,
        onError: handleSSEError,
        onClose: handleSSEClose,
      };

      // Establish connection using listenToSSE function from apiClient
      // It handles fetching auth headers internally.
      sseControllerRef.current = listenToSSE(
        streamUrl,
        callbacks,
        "POST", // Method to trigger the stream generation
        triggerPayload
      );
      // Status will be updated via the onOpen/onError callbacks
    } catch (err: unknown) {
      // Catch synchronous errors ONLY (e.g., error during listenToSSE setup *before* async ops)
      console.error("Synchronous error during connectStream setup:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate connection";
      if (err instanceof AuthError) {
        // Check if it's an AuthError we know
        setError(`Authentication Error: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
      setStatus("error");
      sseControllerRef.current = null;
      // Notify reconstructor if an error happened before connection could even start
      reconstructorRef.current?.handleSSEError(
        err instanceof Error ? err : new Error(errorMessage)
      );
    }
  };

  const disconnectStream = () => {
    if (sseControllerRef.current) {
      sseControllerRef.current.disconnect(); // Calls AbortController.abort() in listenToSSE
      // The sseControllerRef will be cleared in the handleSSEClose callback
      // The status will be updated via the handleSSEClose callback
    } else {
      // If needed, manually reset status if not managed by onClose
      // setStatus('closed');
      // reconstructorRef.current?.resetState();
    }
  };

  // --- Helper function to format JSON for display ---
  const formatJson = (value: PartialJsonValue): string => {
    if (value === null) {
      return "null";
    } if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // --- Rendering Logic (Uses `message` state updated by the reconstructor) ---
  const renderContentBlock = (block: ContentBlock, index: number) => {
    const currentBuffer = buffers.get(index); // Get buffer for this block index
    const parsedJson = parsedJsonResults.get(index); // Get parsed JSON for this block
    const isStreaming = !block.stop_timestamp; // Check if the block is still streaming

    switch (block.type) {
      case "text": {
        const textBlock = block;
        return (
          <div
            key={textBlock.id ?? index}
            style={{
              whiteSpace: "pre-wrap",
              borderBottom: "1px dashed #eee",
              paddingBottom: "5px",
              marginBottom: "5px",
            }}
          >
            <strong>Text:</strong> {textBlock.text ?? <em>(empty)</em>}
            <small style={{ display: "block", color: "grey" }}>
              ID: {textBlock.id}
            </small>
          </div>
        );
      }
      case "tool_use": {
        const toolUse = block;
        // Try to use parsed JSON first, if available and streaming
        const inputDisplay =
          isStreaming && parsedJson !== undefined
            ? formatJson(parsedJson) // Show formatted partial JSON result
            : isStreaming && currentBuffer !== undefined
              ? currentBuffer // Fallback to buffer if no parsed result
              : typeof toolUse.input === "object" && toolUse.input
                ? JSON.stringify(toolUse.input, null, 2) // Show formatted final JSON
                : String(toolUse.input ?? ""); // Handle null/undefined/non-object final input

        // Determine if we should show the "(streaming...)" indicator
        const showStreamingIndicator =
          isStreaming &&
          parsedJson === undefined &&
          currentBuffer === undefined &&
          !toolUse.input;

        return (
          <div
            key={toolUse.id ?? index}
            style={{
              borderBottom: "1px dashed #eee",
              paddingBottom: "5px",
              marginBottom: "5px",
              background: "#f0f8ff",
              padding: "5px",
            }}
          >
            <strong>Tool Use:</strong> {toolUse.name} (ID: {toolUse.id})
            {toolUse.message && (
              <p>
                <em>{toolUse.message}</em>
              </p>
            )}
            <pre
              style={{
                background: "#eee",
                padding: "5px",
                maxHeight: "100px",
                overflow: "auto",
                whiteSpace: "pre-wrap", // Allow wrapping of long JSON lines
                wordBreak: "break-all", // Break long words/strings
              }}
            >
              Input:{" "}
              {showStreamingIndicator ? <em>(streaming...)</em> : inputDisplay}
            </pre>
            <small style={{ display: "block", color: "grey" }}>
              Block ID: {toolUse.id}
            </small>
          </div>
        );
      }
      case "tool_result": {
        const toolResult = block;
        // Try to use parsed JSON first, if available and streaming
        const contentDisplay =
          isStreaming && parsedJson !== undefined
            ? formatJson(parsedJson) // Show formatted partial JSON result
            : isStreaming && currentBuffer !== undefined
              ? currentBuffer // Fallback to buffer if no parsed result
              : typeof toolResult.content === "object" && toolResult.content
                ? JSON.stringify(toolResult.content, null, 2) // Show formatted final JSON
                : JSON.stringify(toolResult.content ?? {}, null, 2); // Handle null/undefined/non-object final content

        // Determine if we should show the "(streaming...)" indicator
        const showStreamingIndicator =
          isStreaming &&
          parsedJson === undefined &&
          currentBuffer === undefined &&
          !toolResult.content &&
          !toolResult.is_error;

        // Custom rendering for text type tool results
        const textJsonArr = parsedJson as { type?: string; text?: string }[];
        if (
          Array.isArray(textJsonArr) &&
          textJsonArr.length > 0 &&
          textJsonArr[0].type === "text"
        ) {
          return textJsonArr.map((textBlock) => (
            <div
              key={textBlock.text ?? index}
              style={{
                borderBottom: "1px dashed #eee",
                paddingBottom: "5px",
                marginBottom: "5px",
                background: toolResult.is_error ? "#fff0f0" : "#f0fff0",
                padding: "5px",
              }}
            >
              <strong>Tool Result (Text):</strong> {toolResult.name} (for Tool
              Use ID: {toolResult.tool_use_id})
              {toolResult.is_error && (
                <strong style={{ color: "red" }}> [ERROR]</strong>
              )}
              {toolResult.message && (
                <p>
                  <em>{toolResult.message}</em>
                </p>
              )}
              <div
                style={{
                  background: "#eee",
                  padding: "10px",
                  borderRadius: "5px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {showStreamingIndicator ? (
                  <em>(streaming...)</em>
                ) : (
                  textBlock.text
                )}
              </div>
              <small style={{ display: "block", color: "grey" }}>
                Block ID: {toolResult.id}
              </small>
            </div>
          ));
        }

        // Default rendering for other tool result types
        return (
          <div
            key={toolResult.id ?? index}
            style={{
              borderBottom: "1px dashed #eee",
              paddingBottom: "5px",
              marginBottom: "5px",
              background: toolResult.is_error ? "#fff0f0" : "#f0fff0",
              padding: "5px",
            }}
          >
            <strong>Tool Result:</strong> {toolResult.name} (for Tool Use ID:{" "}
            {toolResult.tool_use_id})
            {toolResult.is_error && (
              <strong style={{ color: "red" }}> [ERROR]</strong>
            )}
            {toolResult.message && (
              <p>
                <em>{toolResult.message}</em>
              </p>
            )}
            <pre
              style={{
                background: "#eee",
                padding: "5px",
                maxHeight: "150px",
                overflow: "auto",
                whiteSpace: "pre-wrap", // Allow wrapping
                wordBreak: "break-all", // Break long strings
              }}
            >
              Result:{" "}
              {showStreamingIndicator ? (
                <em>(streaming...)</em>
              ) : (
                contentDisplay
              )}
            </pre>
            <small style={{ display: "block", color: "grey" }}>
              Block ID: {toolResult.id}
            </small>
          </div>
        );
      }
      default: {
        const unknownBlock = block as { type?: string }; // Safer typing
        console.warn("Rendering unknown block type:", unknownBlock?.type);
        return (
          <div key={index}>
            <em>Unknown block type: {unknownBlock?.type ?? "N/A"}</em>
          </div>
        );
      }
    }
  };

  // --- Component Return ---
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2>Streaming Chat Display (listenToSSE + Modified Reconstructor)</h2>
      <div>
        <button
          onClick={connectStream}
          disabled={
            status === "connecting" ||
            status === "open" ||
            status === "streaming"
          }
        >
          {status === "connecting" ? "Connecting..." : "Start Stream"}
        </button>
        <button
          onClick={disconnectStream}
          // Disable disconnect unless connection is active or trying to connect
          disabled={
            !sseControllerRef.current &&
            status !== "connecting" &&
            status !== "open" &&
            status !== "streaming"
          }
        >
          Disconnect
        </button>
      </div>
      <div style={{ marginTop: "10px" }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <hr style={{ margin: "15px 0" }} />

      {/* Render based on the 'message' state managed by the reconstructor */}
      {message ? (
        <div
          style={{
            border: "1px solid #eee",
            padding: "10px",
            marginTop: "10px",
            background: "#f9f9f9",
          }}
        >
          <h3>Message (ID: {message.id})</h3>
          <p>
            <strong>Role:</strong> {message.role}
          </p>
          <p>
            <strong>Thread:</strong> {message.threadId}
          </p>
          {/* Display status from the message object if available, otherwise use component status */}
          <p>
            <strong>Overall Status:</strong> {message.status ?? status}
          </p>
          {message.finishReason && (
            <p>
              <strong>Finish Reason:</strong> {message.finishReason}
            </p>
          )}
          <h4>Content:</h4>
          {message.content?.length > 0
            ? message.content.map(renderContentBlock) // Render the blocks using the updated message state
            : // Show streaming text only if connection is open/streaming AND content is empty
            (status === "open" || status === "streaming") && (
              <em>(Content streaming...)</em>
            )}
        </div>
      ) : (
        // Show waiting text if connection is open/streaming but message hasn't started
        (status === "open" || status === "streaming") && (
          <p>Waiting for message stream...</p>
        )
      )}
    </div>
  );
}

export default StreamingChatDisplay;
