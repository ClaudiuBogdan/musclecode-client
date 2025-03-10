import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { streamMessage, syncThreads } from "../lib/api/chat";
import {
  Message,
  ChatStore,
  Thread,
  ClientThreadUpdate,
  ThreadDto,
} from "../types/chat";
import { createJSONStorage, persist } from "zustand/middleware";
import { createLogger } from "@/lib/logger";

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
        set((state) => {
          const activeThread = state
            .getThreadsByAlgorithm(algorithmId)
            .sort((a, b) => a.updatedAt - b.updatedAt)[0];

          return {
            ...state,
            activeAlgorithmId: algorithmId,
            activeThreadId: activeThread?.id || null,
          };
        });

        // Trigger a sync when algorithm ID changes
        get().syncThreads();
      },

      sendMessage: async (message: string, parentId?: string | null) => {
        let { activeThreadId } = get();
        const { activeAlgorithmId, inputMessage, status } = get();
        const content = message || inputMessage;

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

        if (!parentId) {
          parentId =
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
            parentId,
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
            threadId: activeThreadId,
            parentId,
            algorithmId: activeAlgorithmId,
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
        await get().sendMessage(newContent, message.parentId);
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

      retryMessage: async (messageId: string) => {
        const { threads, activeThreadId } = get();
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

        get().sendMessage(parentMessage.content, parentMessage.id);
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

      voteMessage: (messageId: string, isUpvote: boolean) => {
        set((state) => {
          const { threads, activeThreadId } = state;
          if (!activeThreadId) return state;

          const thread = threads[activeThreadId];
          const messages = thread.messages.map((msg) => {
            if (msg.id === messageId) {
              const currentVotes = msg.votes || { upvotes: 0, downvotes: 0 };
              const currentUserVote = currentVotes.userVote;

              // Remove previous vote if exists
              if (currentUserVote) {
                if (currentUserVote === "up") currentVotes.upvotes--;
                if (currentUserVote === "down") currentVotes.downvotes--;
              }

              // Add new vote
              if (isUpvote) {
                currentVotes.upvotes++;
                currentVotes.userVote = "up";
              } else {
                currentVotes.downvotes++;
                currentVotes.userVote = "down";
              }

              return {
                ...msg,
                votes: currentVotes,
              };
            }
            return msg;
          });

          return {
            ...state,
            threads: {
              ...threads,
              [activeThreadId]: {
                ...thread,
                messages,
              },
            },
          };
        });
      },

      copyMessage: async (messageId: string) => {
        const state = get();
        const { threads, activeThreadId } = state;
        if (!activeThreadId) return;

        const thread = threads[activeThreadId];
        const message = thread.messages.find((msg) => msg.id === messageId);

        if (message) {
          await navigator.clipboard.writeText(message.content);
          // TODO: Add toast notification
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

export default useChatStore;
