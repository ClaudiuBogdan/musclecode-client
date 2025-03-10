import { streamRequest } from "./client";

export async function streamMessage(args: {
  messageId: string;
  content: string;
  threadId: string;
  algorithmId: string;
  parentId: string;
}): Promise<ReadableStream<string>> {
  return streamRequest(`api/v1/chat/messages/stream`, "POST", args);
}
