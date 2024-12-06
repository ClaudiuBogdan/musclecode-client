import { Message } from "../types/chat";

export function getConversationThread(
  messages: Record<string, Message>,
  activeMessageId: string | null
): Message[] {
  if (!activeMessageId || !messages[activeMessageId]) {
    return [];
  }

  const thread: Message[] = [];
  let currentId: string | null = activeMessageId;

  while (currentId) {
    const currentMessage: Message = messages[currentId];
    thread.unshift(currentMessage);
    currentId = currentMessage.parentId;
  }

  return thread;
}

export function findLatestLeafMessage(
  messages: Record<string, Message>,
  rootMessageId: string | null
): string | null {
  if (!rootMessageId || !messages[rootMessageId]) {
    return null;
  }

  let currentMessage = messages[rootMessageId];

  while (currentMessage.childrenIds.length > 0) {
    currentMessage =
      messages[
        currentMessage.childrenIds[currentMessage.childrenIds.length - 1]
      ];
  }

  return currentMessage.id;
}
