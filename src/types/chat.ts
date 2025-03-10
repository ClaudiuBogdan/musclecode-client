export interface Thread {
  id: string;
  algorithmId: string;
  messages: Message[];
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
  votes?: {
    upvotes: number;
    downvotes: number;
    userVote?: "up" | "down";
  };
}

// Thread synchronization types
export interface ClientThreadUpdate {
  threadId: string;
  messageCount: number;
}

export interface SyncThreadsRequest {
  threads: ClientThreadUpdate[];
  algorithmId?: string;
}

export interface ThreadDto {
  id: string;
  algorithmId: string;
  createdAt: number;
  updatedAt: number;
  messages: {
    id: string;
    content: string;
    timestamp: number;
    role: "user" | "assistant";
    parentId: string | null;
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
  sendMessage: (message: string, parentId?: string | null) => Promise<void>;
  stopStreaming: () => void;
  startNewChat: () => Promise<void>;
  setEditMessageId: (messageId: string | null) => void;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  switchBranch: (messageId: string) => void;
  streamToken: (messageId: string, token: string) => void;
  completeStream: (messageId: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
  getConversationThread: (threadId: string) => Message[];
  getActiveThread: () => Thread | null;
  setActiveAlgorithmId: (algorithmId: string) => void;
  findLatestLeafMessage: (threadId: string) => string | null;
  getThreadsByAlgorithm: (algorithmId: string) => Thread[];
  setActiveThreadId: (threadId: string) => void;
  voteMessage: (messageId: string, isUpvote: boolean) => void;
  copyMessage: (messageId: string) => Promise<void>;
  updateInputMessage: (message: string) => void;
  syncThreads: () => Promise<void>;
}
