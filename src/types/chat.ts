export interface Message {
  id: string;
  content: string;
  timestamp: number;
  sender: "user" | "assistant";
  status: "pending" | "streaming" | "complete" | "error";
  parentId: string | null;
  childrenIds: string[];
}

export interface ChatState {
  messages: Record<string, Message>;
  rootMessageId: string | null;
  activeMessageId: string | null;
  editingMessageId: string | null;
}

export interface ChatStore extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  switchBranch: (messageId: string) => void;
  streamToken: (messageId: string, token: string) => void;
  completeStream: (messageId: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  getConversationThread: () => Message[];
  findLatestLeafMessage: () => string | null;
}

