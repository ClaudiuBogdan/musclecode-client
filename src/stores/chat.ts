import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, streamMessage, syncThreads } from "../lib/api/chat";
import {
  Message,
  ChatStore,
  Thread,
  ClientThreadUpdate,
  ThreadDto,
  MessageStreamDto,
  Command,
  MessageContext,
} from "../types/chat";
import { createJSONStorage, persist } from "zustand/middleware";
import { createLogger } from "@/lib/logger";
import { getAlgorithmContext } from "@/utils/getAlgorithmContext";

const STREAM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const logger = createLogger({ context: "ChatStore" });

const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: {},
      activeThreadId: null,
      activeAlgorithmId: null,
      lastMessageId: null,
      editingMessageId: null,
      inputMessage: "",
      status: "idle",
      abortController: null,
      isSyncing: false,

      updateInputMessage: (message: string) => {
        set({ inputMessage: message });
      },

      createThread: (algorithmId: string) => {
        const threadId = uuidv4();
        const timestamp = Date.now();

        const newThread: Thread = {
          id: threadId,
          algorithmId,
          messages: [],
          type: "chat",
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          ...state,
          threads: { ...state.threads, [threadId]: newThread },
          activeThreadId: threadId,
        }));

        return threadId;
      },

      setActiveAlgorithmId: (algorithmId: string) => {
        if (algorithmId === get().activeAlgorithmId) return;
        set((state) => {
          return {
            ...state,
            activeAlgorithmId: algorithmId,
            activeThreadId: null,
          };
        });

        // Trigger a sync when algorithm ID changes
        get().syncThreads();
      },

      sendMessage: async (args: {
        message: string;
        parentId?: string | null;
        commands?: Command[];
        context?: MessageContext;
      }) => {
        let { activeThreadId } = get();
        const { activeAlgorithmId, inputMessage, status } = get();
        const content = args.message || inputMessage;
        if (status === "loading") return;

        if (!activeThreadId && activeAlgorithmId) {
          activeThreadId = get().createThread(activeAlgorithmId);
        }

        if (!activeThreadId) {
          throw new Error("No active thread and algorithmId not provided");
        }

        if (!activeAlgorithmId) {
          throw new Error("No active algorithmId");
        }

        const activeThread = get().threads[activeThreadId];

        if (!activeThread) {
          throw new Error("No active thread");
        }

        if (!args.parentId) {
          args.parentId =
            activeThread.messages[activeThread.messages.length - 1]?.id || null;
        }

        try {
          const abortController = new AbortController();
          const newMessageId = uuidv4();
          const userMessage: Message = {
            id: newMessageId,
            threadId: activeThreadId,
            content,
            timestamp: Date.now(),
            sender: "user",
            status: "complete",
            parentId: args.parentId,
            commands: args.commands,
            context: args.context,
          };

          set((state) => ({
            ...state,
            status: "loading",
            inputMessage: "",
            editingMessageId: null,
            abortController,
            threads: {
              ...state.threads,
              [activeThreadId]: {
                ...state.threads[activeThreadId],
                messages: [
                  ...state.threads[activeThreadId].messages,
                  userMessage,
                ],
                updatedAt: Date.now(),
              },
            },
          }));

          const assistantMessageId = uuidv4();
          const assistantMessage: Message = {
            id: assistantMessageId,
            threadId: activeThreadId,
            content: "",
            timestamp: Date.now(),
            sender: "assistant",
            status: "streaming",
            parentId: newMessageId,
          };

          set((state) => ({
            ...state,
            threads: {
              ...state.threads,
              [activeThreadId]: {
                ...state.threads[activeThreadId],
                messages: [
                  ...state.threads[activeThreadId].messages,
                  assistantMessage,
                ],
                updatedAt: Date.now(),
              },
            },
            lastMessageId: assistantMessageId,
          }));

          const stream = await streamMessage({
            messageId: newMessageId,
            assistantMessageId,
            content,
            type: "chat",
            threadId: activeThreadId,
            parentId: args.parentId,
            algorithmId: activeAlgorithmId,
            commands: args.commands,
            context: args.context,
          });
          const reader = stream.getReader();

          // Create an abortable Promise
          const abortPromise = new Promise<never>((_, reject) => {
            const onAbort = () => {
              reject(new Error("Stream aborted"));
              abortController.signal.removeEventListener("abort", onAbort);
            };
            abortController.signal.addEventListener("abort", onAbort);
          });

          const streamTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error("Stream timeout"));
            }, STREAM_TIMEOUT_MS);
          });

          try {
            while (true) {
              const readResult = (await Promise.race([
                reader.read(),
                streamTimeout,
                abortPromise,
              ])) as { done: boolean; value: string };

              if (!readResult || readResult.done) break;
              get().streamToken(assistantMessageId, readResult.value);
            }
            get().completeStream(assistantMessageId);
          } catch (streamError) {
            if ((streamError as Error).message === "Stream aborted") {
              logger.info("Stream was aborted by the user.");
            } else {
              logger.error("Stream Error", {
                error:
                  streamError instanceof Error
                    ? streamError.message
                    : "Unknown stream error",
                stack:
                  streamError instanceof Error ? streamError.stack : undefined,
              });
              set((state) => {
                const thread = state.threads[activeThreadId];
                const messages = thread.messages.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, status: "error" as Message["status"] }
                    : msg
                );
                return {
                  ...state,
                  status: "error",
                  threads: {
                    ...state.threads,
                    [activeThreadId]: {
                      ...thread,
                      messages,
                    },
                  },
                };
              });
            }
          } finally {
            reader.releaseLock();
            set({ abortController: null });
          }
        } catch (error) {
          logger.error("Message Send Failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
          set((state) => ({
            ...state,
            status: "error",
          }));
          throw new Error("Failed to send message");
        }
      },

      sendHintMessage: async (
        hintMessage: MessageStreamDto
      ): Promise<string> => {
        const algorithmId = get().activeAlgorithmId;
        if (!algorithmId) {
          throw new Error("No active algorithmId");
        }

        const thread = getHintThread();

        const lastMessageId =
          thread.messages[thread.messages.length - 1]?.id || null;

        hintMessage.parentId = lastMessageId;
        hintMessage.threadId = thread.id;
        hintMessage.algorithmId = algorithmId;

        const assistantMessage = await sendMessage(hintMessage);

        // update the hint thread with the new hint and assistant messages
        set((state) => {
          const existingHintThread = state.threads[thread.id];
          const hintMsg = {
            id: hintMessage.messageId,
            threadId: thread.id,
            content: hintMessage.content,
            timestamp: Date.now(),
            sender: "user" as const,
            status: "complete" as const,
            parentId: hintMessage.parentId,
          };
          const assistantMsg = {
            id: hintMessage.assistantMessageId,
            threadId: thread.id,
            content: assistantMessage,
            timestamp: Date.now(),
            sender: "assistant" as const,
            status: "complete" as const,
            parentId: hintMsg.id,
          };

          // TODO: find a better way to update the thread
          const updatedThread = existingHintThread
            ? ({
                ...existingHintThread,
                messages: [
                  ...existingHintThread.messages,
                  hintMsg,
                  assistantMsg,
                ],
                updatedAt: Date.now(),
              } as Thread)
            : ({
                ...thread,
                messages: [hintMsg, assistantMsg],
                updatedAt: Date.now(),
              } as Thread);
          return {
            threads: {
              ...state.threads,
              [thread.id]: updatedThread,
            },
          };
        });

        return assistantMessage;
      },

      stopStreaming: () => {
        const { abortController } = get();
        if (abortController) {
          logger.info("Aborting Stream");
          abortController.abort();
          set({ abortController: null, status: "idle" });
        }
      },

      startNewChat: async () => {
        const activeAlgorithmId = get().activeAlgorithmId;
        if (!activeAlgorithmId) {
          throw new Error("algorithmId is required to start a new chat");
        }

        const currentThread = get().getActiveThread();

        if (currentThread?.messages.length === 0) {
          return;
        }

        // Clear empty threads
        const threads = Object.fromEntries(
          Object.entries(get().threads).filter(
            ([, thread]) => thread.messages.length > 0
          )
        );

        set({
          threads,
        });

        const threadId = get().createThread(activeAlgorithmId);

        set({
          lastMessageId: null,
          editingMessageId: null,
          activeThreadId: threadId,
          status: "idle", // Reset status when starting new chat
        });
      },

      setEditMessageId: (messageId: string | null) => {
        set((state) => {
          if (state.status === "loading") return state;
          return {
            ...state,
            editingMessageId: messageId,
          };
        });
      },

      editMessage: async (messageId: string, newContent: string) => {
        const { threads, activeThreadId } = get();
        if (!activeThreadId) return;

        const thread = threads[activeThreadId];
        const messageIndex = thread.messages.findIndex(
          (msg) => msg.id === messageId
        );
        const message = thread.messages[messageIndex];

        if (!message || message.sender !== "user") return;

        // Update the message in place
        set((state) => {
          const thread = state.threads[activeThreadId];
          const messages = thread.messages
            .map((msg, index) => {
              // Remove all messages after the edited message
              if (index >= messageIndex) {
                return null;
              }
              return msg;
            })
            .filter(Boolean) as Message[];

          return {
            ...state,
            threads: {
              ...state.threads,
              [activeThreadId]: {
                ...thread,
                messages,
                updatedAt: Date.now(),
              },
            },
            lastMessageId: message.parentId,
            editingMessageId: null,
          };
        });

        // Generate new assistant response
        await get().sendMessage({
          message: newContent,
          parentId: message.parentId,
        });
      },

      switchBranch: (messageId: string) => {
        const { threads } = get();
        const thread = Object.values(threads).find((t) =>
          t.messages.some((m) => m.id === messageId)
        );

        if (!thread) return;

        set({
          lastMessageId: messageId,
          activeThreadId: thread.id,
          status: "idle", // Reset status when switching branches
        });
      },

      streamToken: (messageId: string, token: string) => {
        try {
          const { threads, activeThreadId } = get();
          if (!activeThreadId) return;

          const thread = threads[activeThreadId];
          const message = thread.messages.find((msg) => msg.id === messageId);
          if (!message) return;

          set((state) => {
            const thread = state.threads[activeThreadId];
            const messages = thread.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: msg.content + token }
                : msg
            );
            return {
              ...state,
              threads: {
                ...state.threads,
                [activeThreadId]: {
                  ...thread,
                  messages,
                  updatedAt: Date.now(),
                },
              },
            };
          });
        } catch (error) {
          logger.error("Stream Token Parse Failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            token,
          });
          return null;
        }
      },

      completeStream: (messageId: string) => {
        const { activeThreadId } = get();
        if (!activeThreadId) return;

        set((state) => {
          const thread = state.threads[activeThreadId];
          const messages = thread.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, status: "complete" as Message["status"] }
              : msg
          );
          return {
            ...state,
            status: "idle",
            threads: {
              ...state.threads,
              [activeThreadId as string]: {
                ...thread,
                messages,
              },
            },
          };
        });
      },

      // TODO: this is a temporary solution to retry a message
      // TODO: we should refactor this to be more robust and handle edge cases
      // I need to update the message data structure and add the context and prompt to the retry.
      retryMessage: async (messageId: string) => {
        const { threads, activeThreadId, activeAlgorithmId } = get();
        if (!activeThreadId) return;

        const thread = threads[activeThreadId];
        const message = thread.messages.find((msg) => msg.id === messageId);

        if (!message || message.sender !== "assistant") return;
        if (!message.parentId) return;

        const parentMessage = thread.messages.find(
          (msg) => msg.id === message.parentId
        );
        if (!parentMessage) return;

        const parentIndex = thread.messages.findIndex(
          (msg) => msg.id === parentMessage.id
        );
        if (parentIndex === -1) return;

        // Delete the message and the children
        const messages = thread.messages
          .map((msg, index) => {
            // Remove all messages after the edited message
            if (index >= parentIndex) {
              return null;
            }
            return msg;
          })
          .filter(Boolean) as Message[];

        set((state) => {
          return {
            ...state,
            threads: {
              ...state.threads,
              [activeThreadId]: { ...thread, messages },
            },
          };
        });

        get().sendMessage({
          message: parentMessage.content,
          parentId: parentMessage.parentId,
          commands: parentMessage.commands,
          context: parentMessage.context,
        });
      },

      getConversationThread: (threadId: string) => {
        const { threads } = get();
        const thread = threads[threadId];
        return thread ? thread.messages : [];
      },

      getActiveThread: () => {
        const { threads, activeThreadId } = get();
        if (!activeThreadId) return null;
        return threads[activeThreadId];
      },

      findLatestLeafMessage: (threadId: string) => {
        const { threads } = get();
        const thread = threads[threadId];
        if (!thread || thread.messages.length === 0) return null;
        return thread.messages[thread.messages.length - 1].id;
      },

      setActiveThreadId: (threadId: string) => {
        set({ activeThreadId: threadId });
      },

      getThreadsByAlgorithm: (algorithmId: string) => {
        const { threads } = get();
        return Object.values(threads).filter(
          (thread) => thread.algorithmId === algorithmId
        );
      },

      copyMessage: async (messageId: string) => {
        const state = get();
        const { threads, activeThreadId } = state;
        if (!activeThreadId) return;

        const thread = threads[activeThreadId];
        const message = thread.messages.find((msg) => msg.id === messageId);

        if (message) {
          await navigator.clipboard.writeText(message.content);
        }
      },

      // Thread synchronization function
      syncThreads: async () => {
        const state = get();

        // Prevent multiple syncs from running simultaneously
        if (state.isSyncing) {
          logger.info("Sync already in progress, skipping");
          return;
        }

        set({ isSyncing: true });

        try {
          logger.info("Starting thread synchronization");

          // Prepare the client thread updates
          const clientThreadUpdates: ClientThreadUpdate[] = Object.values(
            state.threads
          ).map((thread) => ({
            threadId: thread.id,
            messageCount: thread.messages.length,
          }));

          // Call the sync API
          const response = await syncThreads({
            threads: clientThreadUpdates,
            algorithmId: state.activeAlgorithmId || undefined,
          });

          // Process the server response
          if (response.threads && response.threads.length > 0) {
            logger.info(
              `Received ${response.threads.length} updated threads from server`
            );

            // Update local threads with server data
            const updatedThreads = { ...state.threads };

            response.threads.forEach((threadDto: ThreadDto) => {
              // Convert server message format to client format
              const messages: Message[] = threadDto.messages.map((msg) => ({
                id: msg.id,
                threadId: threadDto.id,
                content: msg.content,
                timestamp: msg.timestamp,
                sender: msg.role === "user" ? "user" : "assistant",
                status: "complete",
                parentId: msg.parentId,
                commands: msg.commands,
                context: msg.context,
              }));

              // If thread exists locally, update it
              if (updatedThreads[threadDto.id]) {
                updatedThreads[threadDto.id] = {
                  ...updatedThreads[threadDto.id],
                  messages,
                  updatedAt: threadDto.updatedAt,
                };
              } else {
                // If it's a new thread, create it
                updatedThreads[threadDto.id] = {
                  id: threadDto.id,
                  algorithmId: threadDto.algorithmId,
                  messages,
                  type: threadDto.type,
                  createdAt: threadDto.createdAt,
                  updatedAt: threadDto.updatedAt,
                };
              }
            });

            // Update the store with synchronized threads
            set({
              threads: updatedThreads,
            });

            logger.info("Thread synchronization completed successfully");
          } else {
            logger.info("No thread updates received from server");
          }
        } catch (error) {
          logger.error("Thread synchronization failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      focusHintChat: () => {
        const thread = getHintThread();
        set({ activeThreadId: thread.id });
      },
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize(state) {
        return {
          threads: state.threads,
          activeThreadId: state.activeThreadId,
          activeAlgorithmId: state.activeAlgorithmId,
          lastMessageId: state.lastMessageId,
          editingMessageId: state.editingMessageId,
        };
      },
      onRehydrateStorage: () => (state) => {
        // Reset status to idle on rehydration
        if (state) {
          state.status = "idle";
          state.abortController = null;
        }
      },
    }
  )
);

const getHintThread = () => {
  const timeLimit = Date.now() - 1000 * 60 * 60 * 24; // 24 hours
  const state = useChatStore.getState();
  const algorithmId = state.activeAlgorithmId;
  if (!algorithmId) {
    throw new Error("No active algorithmId");
  }

  const thread = Object.values(state.threads).find(
    (thread) =>
      thread.algorithmId === algorithmId &&
      thread.type === "hint" &&
      thread.createdAt > timeLimit
  );

  if (thread) {
    return thread;
  }

  return {
    id: uuidv4(),
    algorithmId,
    messages: [],
    type: "hint",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export default useChatStore;
