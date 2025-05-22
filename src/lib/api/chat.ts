
import { streamRequest } from "./client";
import { apiClient } from "./client";

import type {
  MessageStreamDto,
  SyncThreadsRequest,
  SyncThreadsResponse,
} from "@/types/chat";

export async function streamMessage(
  args: MessageStreamDto
): Promise<ReadableStream<string>> {
  return streamRequest(
    `api/v1/chat/messages/stream`,
    "POST",
    args as unknown as Record<string, unknown>
  );
}

export async function sendMessage(args: MessageStreamDto): Promise<string> {
  const stream = await streamMessage(args);
  const reader = stream.getReader();
  let finalMessage = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      finalMessage += value;
    }
  } finally {
    reader.releaseLock();
  }
  return finalMessage;
}

/**
 * Synchronizes threads with the server
 * @param request The request containing the client's thread state
 * @returns The server's response with updated threads
 */
export async function syncThreads(
  request: SyncThreadsRequest
): Promise<SyncThreadsResponse> {
  const response = await apiClient.post<SyncThreadsResponse>(
    `api/v1/chat/threads/sync`,
    request
  );
  return response.data;
}
