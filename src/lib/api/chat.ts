import { Message } from "../../types/chat";
import { chatCompletion, streamChatCompletion } from "./openai";

export async function sendMessage(
  content: string,
  history: Message[] = []
): Promise<Message> {
  const response = await chatCompletion(content, history);

  return {
    id: crypto.randomUUID(),
    threadId: crypto.randomUUID(),
    content: response,
    timestamp: Date.now(),
    sender: "assistant",
    status: "complete",
    parentId: null,
  };
}

export async function streamMessage(
  content: string,
  history: Message[] = []
): Promise<ReadableStream<string>> {
  return streamChatCompletion(content, history);
}
