import React, { useEffect } from "react";
import { createMessageReconstructor, PartialJsonValue } from "../parser";
import { ChatMessage, ServerSentEvent } from "../types";
import { StreamingMessageRenderer } from "./StreamingMessageRenderer";

export const ErrorStreamTest: React.FC = () => {
  const [message, setMessage] = React.useState<ChatMessage | null>(null);
  const [buffers, setBuffers] = React.useState<Map<number, string>>(new Map());
  const [parsedJson, setParsedJson] = React.useState<
    Map<number, PartialJsonValue>
  >(new Map());

  useEffect(() => {
    // Create message reconstructor
    const reconstructor = createMessageReconstructor({
      onMessageUpdate: (updatedMessage, updatedBuffers, updatedParsedJson) => {
        setMessage(updatedMessage);
        if (updatedBuffers) setBuffers(new Map(updatedBuffers));
        if (updatedParsedJson) setParsedJson(new Map(updatedParsedJson));
      },
      onMessageComplete: (finalMessage) => {
        console.log("Message complete:", finalMessage);
      },
      onError: (error) => {
        console.error("Reconstructor error:", error);
      },
    });

    // Simulate the error stream events
    const events = [
      {
        type: "message_start",
        message: {
          id: "86736eb7-bb30-4123-8d28-813e22ce71f9",
          createdAt: "2025-04-16T07:19:14.773Z",
          role: "assistant",
          content: [],
          status: "in_progress",
          threadId: "test-thread",
          metadata: { userId: "3d965525-3dff-440d-bca8-a468c3b30ead" },
        },
      },
      {
        type: "message_delta",
        delta: {
          stop_reason: "error",
          stop_sequence: null,
        },
      },
      {
        type: "message_stop",
      },
    ] as ServerSentEvent[];

    // Process events in sequence with delays to simulate streaming
    setTimeout(() => {
      reconstructor.processSSEEvent(events[0]);

      setTimeout(() => {
        reconstructor.processSSEEvent(events[1]);

        setTimeout(() => {
          reconstructor.processSSEEvent(events[2]);
        }, 500);
      }, 500);
    }, 100);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Error Stream Test</h2>

      {message ? (
        <StreamingMessageRenderer
          message={message}
          toolData={{ buffers, parsedJson }}
        />
      ) : (
        <div>Waiting for message...</div>
      )}

      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Raw Message State:</h3>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
          {JSON.stringify(message, null, 2)}
        </pre>
      </div>
    </div>
  );
};
