import React from "react";

import { Markdown } from "@/components/ui/markdown";

import {
  ToolResultContent,
} from "../types";

import type { PartialJsonValue } from "../parser"; // Assuming this is the correct path
import type {
  ChatMessage,
  ContentBlock,
  TextBlock,
  ToolUseContentBlock,
  ToolResultContentBlock} from "../types";

// Helper function to format JSON for display (similar to demo)
const formatJson = (value: PartialJsonValue | unknown): string => {
  if (value === undefined || value === null) {
    return "null"; // Represent undefined/null explicitly
  }
  try {
    // Attempt to stringify, handling potential circular structures safely is complex,
    // but for typical JSON this should work. Consider a more robust library if needed.
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.error("Error formatting JSON:", error);
    // Fallback for non-JSON serializable values or errors
    return String(value);
  }
};

interface StreamingMessageRendererProps {
  message: ChatMessage; // The message being streamed
  toolData: {
    deltaBuffers: Map<number, string>;
    partialInputStream: Map<number, PartialJsonValue>;
  } | null;
}

// --- Component to Render Individual Content Blocks ---
const RenderContentBlock: React.FC<{
  block: ContentBlock;
  index: number;
  toolData: StreamingMessageRendererProps["toolData"];
}> = React.memo(({ block, index, toolData }) => {
  const deltaBuffers = toolData?.deltaBuffers;
  const partialInputStream = toolData?.partialInputStream;

  const currentBuffer = deltaBuffers?.get(index);
  const parsedJson = partialInputStream?.get(index);
  const isStreaming = !block.stop_timestamp; // Check if the block is still generating

  switch (block.type) {
    case "text": {
      const textBlock = block as TextBlock;
      // Render text directly. If streaming, it might appear chunk by chunk.
      return (
        <div className="whitespace-pre-wrap border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 mb-1">
          {/* Removed strong tag for cleaner look, text is the primary content */}
          {textBlock.text ? (
            <Markdown content={textBlock.text} />
          ) : (
            isStreaming ? (
              <span className="italic text-gray-500">(streaming text...)</span>
            ) : (
              <span className="italic text-gray-500">(empty)</span>
            )
          )}
          {/* Optionally show block ID for debugging */}
          {/* <small className="block text-gray-400 dark:text-gray-500 text-xs">ID: {textBlock.id}</small> */}
        </div>
      );
    }
    case "tool_use": {
      const toolUse = block as ToolUseContentBlock;
      // Determine what to display for input: parsed JSON > buffer > final input > streaming indicator
      const partialInput = parsedJson ? formatJson(parsedJson) : null;
      const inputDisplay =
        isStreaming && parsedJson !== undefined
          ? formatJson(parsedJson) // Show formatted partial JSON result
          : isStreaming && currentBuffer !== undefined
            ? currentBuffer // Fallback to buffer if no parsed result yet
            : formatJson(toolUse.input); // Show formatted final JSON or its string representation

      const showStreamingIndicator =
        isStreaming &&
        parsedJson === undefined &&
        currentBuffer === undefined &&
        !toolUse.input;

      return (
        <div className="border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 mb-1 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
          <strong className="text-blue-700 dark:text-blue-300">
            Tool Use:
          </strong>{" "}
          {toolUse.name}
          {toolUse.message && (
            <p className="italic text-sm text-blue-600 dark:text-blue-400">
              {toolUse.message}
            </p>
          )}
            <h2>Partial Input</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-xs mt-1 overflow-auto whitespace-pre-wrap break-all">
            {partialInput}
          </pre>
          <pre className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-xs mt-1 overflow-auto whitespace-pre-wrap break-all">
            Input:{" "}
            {showStreamingIndicator ? (
              <em className="text-gray-500">(streaming...)</em>
            ) : (
              <code>{inputDisplay}</code>
            )}
          </pre>
          {/* <small className="block text-gray-400 dark:text-gray-500 text-xs mt-1">Block ID: {toolUse.id}</small> */}
        </div>
      );
    }
    case "tool_result": {
      const toolResult = block as ToolResultContentBlock;
      // Determine what to display for content: parsed JSON > buffer > final content > streaming indicator
      const contentDisplay =
        isStreaming && parsedJson !== undefined
          ? formatJson(parsedJson) // Show formatted partial JSON result
          : isStreaming && currentBuffer !== undefined
            ? currentBuffer // Fallback to buffer if no parsed result yet
            : toolResult.is_error // If it's a finalized error, content might be a string
              ? String(toolResult.content ?? "")
              : formatJson(toolResult.content); // Format final content (might be string or structured)

      const showStreamingIndicator =
        isStreaming &&
        parsedJson === undefined &&
        currentBuffer === undefined &&
        !toolResult.content &&
        !toolResult.is_error;

      const bgColor = toolResult.is_error
        ? "bg-red-50 dark:bg-red-900/30"
        : "bg-green-50 dark:bg-green-900/30";
      const textColor = toolResult.is_error
        ? "text-red-700 dark:text-red-300"
        : "text-green-700 dark:text-green-300";

      // Check both final content and potentially partially parsed JSON
      let simpleTextResult: string | null = null;
      if (
        !isStreaming &&
        Array.isArray(toolResult.content) &&
        toolResult.content[0]?.type === "text"
      ) {
        simpleTextResult = toolResult.content.map((t) => t.text).join("\n"); // Join if multiple text parts
      } else if (
        isStreaming &&
        Array.isArray(parsedJson) &&
        parsedJson.length > 0 &&
        typeof parsedJson[0] === "object" &&
        parsedJson[0] !== null &&
        "type" in parsedJson[0] &&
        parsedJson[0].type === "text"
      ) {
        // Add checks: is it an array? is the first element an object? does it have a 'type' property? is the type 'text'?
        // Attempt to render streaming text content
        simpleTextResult = (parsedJson as { type?: string; text?: string }[]) // Cast is safer after checks
          .map((t) => t.text ?? "") // Safely access text
          .join("\n");
      }

      return (
        <div
          className={`border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 mb-1 ${bgColor} p-2 rounded-md`}
        >
          <strong className={textColor}>Tool Result:</strong> {toolResult.name}{" "}
          (for Tool Use ID: {toolResult.tool_use_id})
          {toolResult.is_error && (
            <strong className="text-red-600 dark:text-red-400"> [ERROR]</strong>
          )}
          {toolResult.message && (
            <p className="italic text-sm text-gray-600 dark:text-gray-400">
              {toolResult.message}
            </p>
          )}
          {simpleTextResult !== null ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-xs mt-1 whitespace-pre-wrap break-words">
              {/* Render simple text directly */}
              {simpleTextResult ||
                (showStreamingIndicator ? (
                  <em className="text-gray-500">(streaming...)</em>
                ) : (
                  ""
                ))}
            </div>
          ) : (
            <pre className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-xs mt-1 max-h-60 overflow-auto whitespace-pre-wrap break-all">
              Result:{" "}
              {showStreamingIndicator ? (
                <em className="text-gray-500">(streaming...)</em>
              ) : (
                <code>{contentDisplay}</code>
              )}
            </pre>
          )}
          {/* <small className="block text-gray-400 dark:text-gray-500 text-xs mt-1">Block ID: {toolResult.id}</small> */}
        </div>
      );
    }
    default: {
      const unknownBlock = block as { type?: string };
      console.warn("Rendering unknown block type:", unknownBlock?.type);
      return (
        <div
          key={index}
          className="italic text-gray-500 border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 mb-1"
        >
          Unknown block type: {unknownBlock?.type ?? "N/A"}
        </div>
      );
    }
  }
});
RenderContentBlock.displayName = "RenderContentBlock";

// --- Main Streaming Message Component ---
export const StreamingMessageRenderer: React.FC<
  StreamingMessageRendererProps
> = ({ message, toolData }) => {
  // We expect `message` to always be non-null when this component is rendered
  // Based on the logic in ChatThread

  // Determine if there's an error
  const hasError =
    message.status === "failed" || message.finishReason === "error";

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg shadow-sm border ${hasError ? "border-red-200 dark:border-red-800" : "border-blue-200 dark:border-blue-800"} ${!hasError ? "animate-pulse-border" : ""}`}
    >
      {/* Removed Role/Thread/Status display as they are implicit or handled elsewhere */}
      {/* <p><strong>Role:</strong> {message.role}</p> */}
      {/* <p><strong>Thread:</strong> {message.threadId}</p> */}
      {/* <p><strong>Status:</strong> {message.status ?? 'streaming'}</p> */}
      {/* {message.finishReason && <p><strong>Finish Reason:</strong> {message.finishReason}</p>} */}

      {/* Render Content Blocks */}
      <div className="space-y-2">
        {message.content?.length > 0 ? (
          message.content.map((block, index) => (
            <RenderContentBlock
              key={block.id || index} // Prefer stable block.id if available
              block={block}
              index={index}
              toolData={toolData}
            />
          ))
        ) : (
          <em className="text-gray-500">
            {hasError
              ? "An error occurred during message generation."
              : "(Assistant is preparing response...)"}
          </em>
        )}
      </div>

      {/* Display error message */}
      {hasError && (
        <p className="text-xs text-red-400 dark:text-red-300 mt-1">
          Failed to generate message. Please try again.
        </p>
      )}
      {/* Optionally show message ID for debugging */}
      {/* <small className="block text-gray-400 dark:text-gray-500 text-xs mt-2">Msg ID: {message.id}</small> */}
    </div>
  );
};

// Add a specific class for the pulsing border animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes pulse-border-animation {
  0%, 100% { border-color: rgba(59, 130, 246, 0.3); } /* Assuming blue-500 relates to this */
  50% { border-color: rgba(59, 130, 246, 0.7); }
}
.animate-pulse-border {
  animation: pulse-border-animation 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;
document.head.appendChild(style);

StreamingMessageRenderer.displayName = "StreamingMessageRenderer";
