import { streamRequest } from "./client";
import { apiClient } from "./client";
import { SyncThreadsRequest, SyncThreadsResponse } from "@/types/chat";

export async function streamMessage(args: {
  messageId: string;
  content: string;
  threadId: string;
  algorithmId: string;
  parentId: string;
}): Promise<ReadableStream<string>> {
  return streamRequest(`api/v1/chat/messages/stream`, "POST", args);
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
