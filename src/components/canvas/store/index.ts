import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatThread } from "../types";
import { ChatStore, ChatStoreState } from "./types";
import api from "../services/chatApi";

/**
 * Initial state for the chat store
 */
const initialState: ChatStoreState = {
  threads: {},
  currentThreadId: null,
  isLoading: false,
  error: null,
};

/**
 * Create the chat store with Zustand
 */
export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // --- Core Actions ---

      initializeStore: async () => {
        if (get().isLoading || Object.keys(get().threads).length > 0) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          // No need to fetch threads from backend
          // Just use local threads from persistence

          let { currentThreadId } = get();
          const availableThreadIds = Object.keys(get().threads);

          if (!currentThreadId || !get().threads[currentThreadId]) {
            currentThreadId =
              availableThreadIds.length > 0 ? availableThreadIds[0] : null;
          }

          set({
            currentThreadId,
            isLoading: false,
          });

          if (!currentThreadId) {
            // Create a new local thread if none exists
            await get().createThread("New Chat");
          }
        } catch (error) {
          console.error("Failed to initialize store:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error
                : new Error("Failed to initialize store"),
          });
        }
      },

      createThread: async (title, context) => {
        try {
          // TODO: get user id from auth store
          const userId = "placeholder-user-id";
          const threadId = uuidv4();

          // Create a new thread locally without calling the API
          const newThread: ChatThread = {
            id: threadId,
            title: title || `New Chat ${new Date().toLocaleTimeString()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
            attachedContext: context || [],
            metadata: { userId },
          };

          set((state) => {
            state.threads[threadId] = newThread;
            state.currentThreadId = threadId;
          });

          return newThread;
        } catch (error) {
          console.error("Failed to create thread:", error);
          set((state) => {
            state.error =
              error instanceof Error
                ? error
                : new Error("Failed to create thread");
          });
          throw error;
        }
      },

      switchThread: (threadId) => {
        const { threads } = get();
        if (threads[threadId] && threadId !== get().currentThreadId) {
          set({ currentThreadId: threadId });
        } else if (!threads[threadId]) {
          console.error(`Thread with ID ${threadId} not found for switching.`);
        }
      },

      deleteThread: async (threadId) => {
        const { threads } = get();
        const threadToDelete = threads[threadId];

        if (!threadToDelete) {
          console.warn(`Attempted to delete non-existent thread: ${threadId}`);
          return;
        }

        set((state) => {
          delete state.threads[threadId];
          if (state.currentThreadId === threadId) {
            const remainingIds = Object.keys(state.threads);
            state.currentThreadId =
              remainingIds.length > 0 ? remainingIds[0] : null;
          }
        });

        // No need to call API for thread deletion
        // This will be handled during sync
      },

      sendMessage: async (messageData) => {
        const messageId = uuidv4();
        const { threadId, content, parentId, metadata } = messageData;

        const thread = get().threads[threadId];
        if (!thread) {
          console.error(`Thread ${threadId} not found for sending message.`);
          set({ error: new Error(`Thread ${threadId} not found`) });
          return;
        }

        const optimisticMessage: ChatMessage = {
          id: messageId,
          threadId,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
          status: "completed",
          parentId,
          metadata,
        };

        const responseMessage: ChatMessage = {
          id: uuidv4(),
          threadId,
          content: [],
          parentId: messageId,
          role: "assistant",
          createdAt: new Date().toISOString(),
          status: "in_progress",
        };

        get()._addOrUpdateMessage(optimisticMessage);
        get()._addOrUpdateMessage(responseMessage);

        try {
          const sentMessage = await api.sendMessageAPI(
            optimisticMessage,
            responseMessage
          );
          if (sentMessage) {
            const assistantMessage: ChatMessage = {
              ...sentMessage,
            };
            get()._addOrUpdateMessage(assistantMessage);
          }
        } catch (error) {
          console.error("Failed to send message:", error);

          get()._addOrUpdateMessage({
            ...responseMessage,
            status: "failed",
          });

          set((state) => {
            state.error =
              error instanceof Error
                ? error
                : new Error("Failed to send message");
          });
        }
      },

      retrySendMessage: async (messageId, threadId) => {
        const thread = get().threads[threadId];
        if (!thread) {
          console.error(
            `Thread ${threadId} not found for retrying message ${messageId}.`
          );
          return;
        }

        const messageIndex = thread.messages.findIndex(
          (m) => m.id === messageId
        );
        if (messageIndex < 0) {
          console.error(
            `Message ${messageId} not found in thread ${threadId} for retry.`
          );
          return;
        }

        const messageToRetry = thread.messages[messageIndex];

        if (messageToRetry.status !== "failed") {
          console.warn(
            `Message ${messageId} is not in error state, cannot retry.`
          );
          return;
        }

        get()._addOrUpdateMessage({
          ...messageToRetry,
          status: "in_progress",
        });

        try {
          const payload = {
            id: messageToRetry.id,
            threadId: messageToRetry.threadId,
            content: messageToRetry.content,
            parentId: messageToRetry.parentId,
          };

          const responseMessage = {
            id: messageToRetry.id,
          };

          const sentMessage = await api.sendMessageAPI(
            payload,
            responseMessage
          );

          get()._addOrUpdateMessage({
            ...messageToRetry,
            status: "completed",
          });

          if (sentMessage) {
            const assistantMessage: ChatMessage = {
              ...sentMessage,
            };
            get()._addOrUpdateMessage(assistantMessage);
          }
        } catch (error) {
          console.error("Failed to retry message:", error);
          get()._addOrUpdateMessage({
            ...messageToRetry,
            status: "failed",
          });
          set((state) => {
            state.error =
              error instanceof Error
                ? error
                : new Error("Failed to retry message");
          });
        }
      },

      attachContext: (threadId, context) => {
        set((state) => {
          const thread = state.threads[threadId];
          if (!thread) return;

          if (!thread.attachedContext) {
            thread.attachedContext = [];
          }

          const existingIndex = thread.attachedContext.findIndex(
            (c) =>
              c.id === context.id || (context.unique && c.type === context.type)
          );

          if (existingIndex >= 0) {
            thread.attachedContext[existingIndex] = context;
          } else {
            thread.attachedContext.push(context);
          }
          thread.updatedAt = new Date().toISOString();
        });
      },

      removeContext: (threadId, contextId) => {
        set((state) => {
          const thread = state.threads[threadId];
          if (!thread || !thread.attachedContext) return;

          thread.attachedContext = thread.attachedContext.filter(
            (c) => c.id !== contextId
          );
          thread.updatedAt = new Date().toISOString();
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // --- Internal Helper Implementations ---

      _addOrUpdateMessage: (message) => {
        set((state) => {
          const { threadId } = message;
          const thread = state.threads[threadId];
          if (!thread) {
            console.warn(
              `Thread ${threadId} not found while trying to add/update message ${message.id}`
            );
            return;
          }

          const messageIndex = thread.messages.findIndex(
            (m) => m.id === message.id
          );

          if (messageIndex >= 0) {
            thread.messages[messageIndex] = message;
          } else {
            thread.messages.push(message);
          }

          thread.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          thread.updatedAt = new Date().toISOString();
        });
      },
    })),
    // --- Persist Configuration ---
    {
      name: "chat-store-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId,
      }),
      onRehydrateStorage: () => {
        return (_, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
          }
        };
      },
    }
  )
);

// --- Custom Hooks (Selectors) ---

/**
 * Custom hook to get the current chat thread object.
 */
export const useCurrentChatThread = (): ChatThread | null => {
  const storeThread = useChatStore((state) =>
    state.currentThreadId ? state.threads[state.currentThreadId] : null
  );

  return storeThread as unknown as ChatThread | null;
};

/**
 * Custom hook to get messages ONLY from the current thread.
 */
const EMPTY_MESSAGES: ChatMessage[] = [];
export const useCurrentChatMessages = (): ChatMessage[] => {
  const messages = useChatStore((state) =>
    state.currentThreadId
      ? state.threads[state.currentThreadId]?.messages || EMPTY_MESSAGES
      : EMPTY_MESSAGES
  );

  return messages as unknown as ChatMessage[];
};

/**
 * Custom hook to get all thread IDs and titles for a list view.
 */
export const useThreadList = (): {
  id: string;
  title?: string;
  createdAt: string;
}[] => {
  return useChatStore((state) =>
    Object.values(state.threads)
      .map((thread) => ({
        id: thread.id,
        title: thread.title || "Untitled Chat",
        createdAt: thread.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );
};
