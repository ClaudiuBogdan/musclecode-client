import { Message, Thread } from "../types/chat";

export function getConversationThread(
  messages: Record<string, Message>,
  threadId: string | null
): Message[] {
  if (!threadId) return [];

  const threadMessages = Object.values(messages)
    .filter((msg) => msg.threadId === threadId)
    .sort((a, b) => a.timestamp - b.timestamp);

  return threadMessages;
}

export function findLatestLeafMessage(
  messages: Record<string, Message>,
  threadId: string | null
): string | null {
  if (!threadId) return null;

  const threadMessages = Object.values(messages)
    .filter((msg) => msg.threadId === threadId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const leafMessage = threadMessages.find((msg) => msg.parentId === null);
  return leafMessage?.id || null;
}

export function getThreadsByAlgorithm(
  threads: Record<string, Thread>,
  algorithmId: string
): Thread[] {
  return Object.values(threads)
    .filter((thread) => thread.algorithmId === algorithmId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
