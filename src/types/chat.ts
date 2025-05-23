export interface Thread {
  id: string;
  algorithmId: string;
  messages: Message[];
  type: "hint" | "chat";
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  threadId: string;
  content: string;
  timestamp: number;
  sender: "user" | "assistant";
  status: "pending" | "streaming" | "complete" | "error";
  parentId: string | null;
  commands?: Command[];
  context?: MessageContext;
}

// Thread synchronization types
export interface ClientThreadUpdate {
  threadId: string;
  messageCount: number;
}

export interface ContextFile {
  name: string;
  description: string;
  content: string;
}

export interface MessageContext {
  prompt?: "hint-prompt";
  files?: ContextFile[];
}

export interface Command {
  name: string;
  description: string;
  command: string;
  prompt: string;
}

export interface MessageStreamDto {
  messageId: string;
  assistantMessageId: string;
  content: string;
  type: "chat" | "hint";
  threadId: string;
  algorithmId: string;
  parentId: string | null;
  context?: MessageContext;
  commands?: Command[];
}

export interface SyncThreadsRequest {
  threads: ClientThreadUpdate[];
  algorithmId?: string;
}

export interface ThreadDto {
  id: string;
  algorithmId: string;
  type: "hint" | "chat";
  createdAt: number;
  updatedAt: number;
  messages: {
    id: string;
    content: string;
    timestamp: number;
    role: "user" | "assistant";
    parentId: string | null;
    commands?: Command[];
    context?: MessageContext;
  }[];
}

export interface SyncThreadsResponse {
  threads: ThreadDto[];
}

export interface ChatState {
  threads: Record<string, Thread>;
  activeThreadId: string | null;
  activeAlgorithmId: string | null;
  lastMessageId: string | null;
  status: "idle" | "loading" | "error";
  inputMessage: string;
  editingMessageId: string | null;
  abortController: AbortController | null;
  isSyncing: boolean;
}

export interface ChatStore extends ChatState {
  createThread: (algorithmId: string) => string;
  sendHintMessage: (message: MessageStreamDto) => Promise<string>;
  sendMessage: (args: {
    message: string;
    parentId?: string | null;
    commands?: Command[];
    context?: MessageContext;
  }) => Promise<void>;
  stopStreaming: () => void;
  startNewChat: () => void;
  setEditMessageId: (messageId: string | null) => void;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  switchBranch: (messageId: string) => void;
  streamToken: (messageId: string, token: string) => void;
  completeStream: (messageId: string) => void;
  retryMessage: (messageId: string) => void;
  getConversationThread: (threadId: string) => Message[];
  getActiveThread: () => Thread | null;
  setActiveAlgorithmId: (algorithmId: string) => void;
  findLatestLeafMessage: (threadId: string) => string | null;
  getThreadsByAlgorithm: (algorithmId: string) => Thread[];
  setActiveThreadId: (threadId: string) => void;
  copyMessage: (messageId: string) => Promise<void>;
  updateInputMessage: (message: string) => void;
  syncThreads: () => Promise<void>;
  focusHintChat: () => void;
}
