import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  ChatThread,
  ServerSentEvent,
  ContentBlock,
  ContextReference,
  ModelContext,
} from "../types";
import { ChatStore, ChatStoreState } from "./types";
import { listenToSSE, SSEController, SSECallbacks } from "@/lib/api/client";
import { AppError } from "@/lib/errors/types";
import {
  createMessageReconstructor,
  PartialJsonValue,
  ReconstructorControls,
} from "../parser";
import { useModelsStore } from "@/stores/models";
import { toast } from "sonner";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

// --- Define Connection Status Type ---
type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "streaming" // Receiving message parts
  | "error"
  | "closed" // Clean close by server or user
  | "completed"; // Message reconstruction finished

/**
 * Initial state for the chat store
 */
const initialState: ChatStoreState = {
  threads: {},
  currentThreadId: null,
  isLoading: false,
  error: null,
  streamingAssistantMessage: null,
  streamingToolData: null,
  connectionStatus: "idle",
  connectionError: null,
};

/**
 * Create the chat store with Zustand
 */
export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => {
      // --- Non-Serializable Instances (Managed outside state) ---
      let sseController: SSEController | null = null;
      let reconstructor: ReconstructorControls | null = null;
      // TODO: Move to config or env variable
      const streamUrl = `${env.VITE_API_URL}/api/v1/chat/messages/stream-complex`;

      // --- Define Store-Internal Callbacks for Reconstructor & SSE ---
      // These use `set` to update the store state

      const _handleMessageUpdate = (
        updatedMessage: ChatMessage | null,
        updatedBuffers?: Map<number, string>,
        updatedParsedJson?: Map<number, PartialJsonValue>
      ) => {
        set((state) => {
          state.streamingAssistantMessage = updatedMessage;
          if (updatedBuffers || updatedParsedJson) {
            state.streamingToolData = {
              deltaBuffers: updatedBuffers ? new Map(updatedBuffers) : new Map(),
              partialInputStream: updatedParsedJson
                ? // @ts-expect-error - TODO: Fix this
                  new Map(updatedParsedJson)
                : new Map(),
            };
          } else if (!updatedMessage) {
            state.streamingToolData = null; // Clear if message is reset
          }
          // Update status only if message is present and we are in a connected/streaming state
          if (
            updatedMessage &&
            (state.connectionStatus === "open" ||
              state.connectionStatus === "streaming")
          ) {
            state.connectionStatus = "streaming";
          }
          // Clear error when streaming starts successfully
          if (state.connectionStatus === "streaming") {
            state.connectionError = null;
          }
        });
      };

      const _handleMessageComplete = (finalMessage: ChatMessage) => {
        // Ensure the final message has 'completed' status
        const completedMessage = {
          ...finalMessage,
          threadId: get().currentThreadId!, // TODO: Fixme review this. Maybe the final message should have the thread id
          status: "completed" as const,
        };
        get()._addOrUpdateMessage(completedMessage); // Add the completed message to the thread

        set((state) => {
          state.streamingAssistantMessage = null; // Clear streaming message
          state.streamingToolData = null; // Clear streaming data
          state.connectionStatus = "completed"; // Set final status
          state.connectionError = null; // Clear any previous error
        });
        // Reset controllers after completion
        sseController = null;
        reconstructor = null;
      };

      const _handleReconstructorError = (error: Error) => {
        console.error("STORE Reconstructor Error:", error);
        set((state) => {
          state.connectionError = `Reconstruction Error: ${error.message}`;
          state.connectionStatus = "error";
          // Keep potentially partial message/data for inspection? Or clear? Let's clear.
          state.streamingAssistantMessage = null;
          state.streamingToolData = null;
        });
        // Optionally disconnect if reconstructor fails severely?
        // get().disconnectStream();
        sseController = null; // Assume connection is unusable
        reconstructor = null;
      };

      const _handleSSEOpen = () => {
        set({ connectionStatus: "open", connectionError: null });
        reconstructor?.handleSSEOpen(); // Notify reconstructor
      };

      const _handleSSEMessage = (eventData: ServerSentEvent | unknown) => {
        // Basic validation
        if (
          typeof eventData === "object" &&
          eventData !== null &&
          "type" in eventData
        ) {
          reconstructor?.processSSEEvent(eventData as ServerSentEvent);
        } else {
          console.warn("Store received unexpected SSE data format:", eventData);
          // Trigger error state as we don't know how to handle this
          const error = new Error(
            `Received unexpected data format: ${typeof eventData}`
          );
          set((state) => {
            state.connectionError = error.message;
            state.connectionStatus = "error";
            state.streamingAssistantMessage = null;
            state.streamingToolData = null;
          });
          reconstructor?.handleSSEError(error);
          // Disconnect on unexpected data
          get().disconnectStream();
        }
      };

      const _handleSSEError = (error: Error) => {
        console.error("STORE SSE Error:", error);
        // Add type guards if needed (e.g., for AuthError)
        const errorMessage =
          error instanceof AppError
            ? `${error.name}: ${error.message}`
            : error.message;
        set((state) => {
          state.connectionError = errorMessage;
          state.connectionStatus = "error";
          state.streamingAssistantMessage = null; // Clear potentially partial message
          state.streamingToolData = null;
        });
        reconstructor?.handleSSEError(error); // Notify reconstructor
        sseController = null; // Clear controller ref
        reconstructor = null; // Clear reconstructor ref
      };

      const _handleSSEClose = () => {
        logger.info("STORE SSE Close triggered.");
        // Connection closed - update status if not already completed or errored
        set((state) => {
          if (
            state.connectionStatus !== "completed" &&
            state.connectionStatus !== "error"
          ) {
            logger.info("STORE: Setting status to 'closed'.");
            state.connectionStatus = "closed";
            // Clear potentially incomplete streaming data if closed unexpectedly
            state.streamingAssistantMessage = null;
            state.streamingToolData = null;
            state.connectionError =
              state.connectionError ?? "Connection closed unexpectedly."; // Set error if none exists
          } else {
            logger.info("STORE: Status is already 'closed', not changing.");
          }
        });
        reconstructor?.handleSSEClose(); // Notify reconstructor
        sseController = null; // Clear controller ref
        reconstructor = null; // Clear reconstructor ref
      };

      // --- Action Implementations ---
      return {
        ...initialState,

        // --- Existing Actions (potentially modified) ---

        initializeStore: async () => {
          // Existing logic seems okay, but ensure initial streaming state is correct
          if (get().isLoading || Object.keys(get().threads).length > 0) {
            // Ensure streaming state is reset on re-init if needed
            if (get().connectionStatus !== "idle") {
              set({
                ...initialState,
                threads: get().threads,
                currentThreadId: get().currentThreadId,
              }); // Reset streaming state but keep threads
            }
            return;
          }
          // ... (rest of existing logic) ...
          // Ensure initial state includes reset streaming fields
          set((state) => ({
            ...state, // keep results of try block
            isLoading: false,
            // Reset streaming state on initialization
            streamingAssistantMessage: null,
            streamingToolData: null,
            connectionStatus: "idle",
            connectionError: null,
          }));
          const currentThreadId = get().currentThreadId;
          if (!currentThreadId) {
            // Create a new local thread if none exists
            await get().createThread("New Chat");
          }
        },

        createThread: async (title?: string, context?: ContextReference[]) => {
          // --- Disconnect stream before creating a new thread and switching ---
          if (sseController) {
            logger.info(
              "Disconnecting active stream before creating new thread."
            );
            get().disconnectStream(); // Ensure clean state before switching
          }
          // --- Reset state parts related to streaming ---
          set({
            streamingAssistantMessage: null,
            streamingToolData: null,
            connectionStatus: "idle",
            connectionError: null,
          });
          // --- Existing thread creation logic ---
          try {
            const threadId = uuidv4();
            const newThread: ChatThread = {
              id: threadId,
              title: title || `New Chat ${new Date().toLocaleTimeString()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: [],
              attachedContext: context || [],
            };

            set((state) => {
              state.threads[threadId] = newThread;
              state.currentThreadId = threadId; // Switch to the new thread
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

        switchThread: (threadId: string) => {
          const { threads } = get();
          const currentId = get().currentThreadId;

          if (threads[threadId] && threadId !== currentId) {
            // Disconnect stream if switching away from the thread with an active stream
            if (sseController) {
              logger.info("Disconnecting active stream due to thread switch.");
              get().disconnectStream(); // This will also reset state via _handleSSEClose
            } else {
              // If no controller, still reset local streaming state manually
              set({
                streamingAssistantMessage: null,
                streamingToolData: null,
                connectionStatus: "idle",
                connectionError: null,
              });
            }
            // Set the new thread ID
            set({ currentThreadId: threadId });
          } else if (!threads[threadId]) {
            console.error(
              `Thread with ID ${threadId} not found for switching.`
            );
          }
        },

        deleteThread: async (threadId: string) => {
          const { threads } = get();
          const threadToDelete = threads[threadId];
          const currentId = get().currentThreadId;

          if (!threadToDelete) {
            console.warn(
              `Attempted to delete non-existent thread: ${threadId}`
            );
            return;
          }

          // Disconnect stream if deleting the active thread
          if (threadId === currentId && sseController) {
            logger.info(
              "Disconnecting active stream due to deleting active thread."
            );
            get().disconnectStream(); // Disconnect first
          }

          // Existing deletion logic
          set((state) => {
            delete state.threads[threadId];
            if (state.currentThreadId === threadId) {
              const remainingIds = Object.keys(state.threads);
              state.currentThreadId =
                remainingIds.length > 0 ? remainingIds[0] : null;
              // Reset streaming state explicitly if the deleted thread was current
              state.streamingAssistantMessage = null;
              state.streamingToolData = null;
              state.connectionStatus = "idle";
              state.connectionError = null;
            }
          });
          // No API call needed here per original logic
        },

        // --- Core Streaming Send Action ---
        sendMessage: async (messageData: {
          threadId: string;
          content: ContentBlock[]; // Expect structured content
          parentId?: string;
          metadata?: Record<string, unknown>;
        }) => {
          const { threadId, content, parentId, metadata } = messageData;
          const currentConnectionStatus = get().connectionStatus;

          // --- Prevent sending if already streaming/connecting ---
          if (
            currentConnectionStatus === "connecting" ||
            currentConnectionStatus === "open" ||
            currentConnectionStatus === "streaming"
          ) {
            console.warn(
              `Stream already active (Status: ${currentConnectionStatus}). Please wait or disconnect.`
            );
            set({
              connectionError:
                "Please wait for the current response to finish.",
            });
            return;
          }

          // --- Ensure thread exists ---
          const thread = get().threads[threadId];
          if (!thread) {
            console.error(`Thread ${threadId} not found for sending message.`);
            set({ error: new Error(`Thread ${threadId} not found`) }); // Use general error?
            return;
          }

          // --- 1. Add optimistic user message ---
          const optimisticMessage: ChatMessage = {
            id: uuidv4(),
            threadId,
            role: "user",
            content, // Assumes content is already correctly structured [{ type: 'text', text: '...'}, ...]
            createdAt: new Date().toISOString(),
            status: "completed", // User message is always complete
            parentId,
            metadata,
          };
          get()._addOrUpdateMessage(optimisticMessage);

          // --- 2. Reset previous stream state & Prepare for new stream ---
          set({
            streamingAssistantMessage: null,
            streamingToolData: null,
            connectionStatus: "connecting",
            connectionError: null,
            error: null, // Clear general error as well
          });

          // --- 3. Initialize Reconstructor ---
          // Ensure any previous instance is cleaned up (should be by disconnect/close handlers)
          reconstructor = createMessageReconstructor({
            onMessageUpdate: _handleMessageUpdate,
            onMessageComplete: _handleMessageComplete,
            onError: _handleReconstructorError,
          });
          reconstructor.resetState(); // Start clean

          // --- 4. Prepare Payload for SSE trigger ---
          const triggerPayload = {
            // REQUIRED: Construct payload based on backend API spec
            message: optimisticMessage, // Example: Send the user message
            // threadId: threadId, // Often needed
            context: [] as ContextReference[], // Send context if backend requires
          };

          // --- 5. Initiate SSE Connection ---
          try {
            const geminiModel = useModelsStore.getState().getActiveModels().find(
              (model) => model.provider === "gemini"
            );

            if (!geminiModel) {
              throw new Error("No active Gemini model found");
            }

            const modelContext: ModelContext = {
              id: geminiModel.id,
              type: "model",
              model: geminiModel,
            };

            triggerPayload.context.push(modelContext);

            const callbacks: SSECallbacks = {
              onOpen: _handleSSEOpen,
              onMessage: _handleSSEMessage,
              onError: _handleSSEError, // Centralized SSE error handling
              onClose: _handleSSEClose, // Centralized SSE close handling
            };

            // Assuming listenToSSE is imported correctly and handles auth internally
            sseController = listenToSSE(
              streamUrl,
              callbacks,
              "POST", // Method is typically POST for triggering stream
              triggerPayload
            );
            // Status updates (connecting -> open/error) handled by callbacks
          } catch (err: unknown) {
            // Catch SYNCHRONOUS errors during listenToSSE setup ONLY
            console.error(
              "STORE: Synchronous error during sendMessage stream setup:",
              err
            );
            // Use the centralized error handler
            _handleSSEError(
              err instanceof Error ? err : new Error(String(err))
            );
            // sseController should be null already if setup failed
            // reconstructor will be cleaned up by _handleSSEError
            // Remove the message from the thread
            get()._addOrUpdateMessage({
              ...optimisticMessage,
              status: "failed",
            });
            toast.error("Failed to send message. Please try again.", {
              description: err instanceof Error ? err.message : "Unknown error",
            });
          }
        },

        // --- Action to manually disconnect ---
        disconnectStream: () => {
          if (sseController) {
            logger.info("STORE: Disconnecting stream manually...");
            sseController.disconnect(); // This triggers onClose -> _handleSSEClose eventually
            // State updates (status, controller = null) are handled by _handleSSEClose
            // Immediately set status to 'closed' for faster UI feedback? Or wait for onClose?
            // Let's wait for onClose to keep logic centralized.
          } else {
            logger.info("STORE: No active stream to disconnect.");
            // Manually reset state if somehow out of sync
            const status = get().connectionStatus;
            if (
              status !== "idle" &&
              status !== "completed" &&
              status !== "closed" &&
              status !== "error"
            ) {
              set({
                streamingAssistantMessage: null,
                streamingToolData: null,
                connectionStatus: "closed", // Force closed if no controller but status was active
                connectionError: null,
              });
              reconstructor = null; // Ensure cleanup
            }
          }
        },

        // --- Other Actions ---
        attachContext: (threadId: string, context: ContextReference) => {
          set((state) => {
            const thread = state.threads[threadId];
            if (!thread) return;

            if (!thread.attachedContext) {
              thread.attachedContext = [];
            }

            const existingIndex = thread.attachedContext.findIndex(
              (c) =>
                c.id === context.id ||
                (context.unique && c.type === context.type)
            );

            if (existingIndex >= 0) {
              thread.attachedContext[existingIndex] = context;
            } else {
              thread.attachedContext.push(context);
            }
            thread.updatedAt = new Date().toISOString();
          });
        },

        removeContext: (threadId: string, contextId: string) => {
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
          set({ error: null, connectionError: null }); // Clear both types of errors
        },

        // --- Internal Helper ---
        _addOrUpdateMessage: (message: ChatMessage) => {
          set((state) => {
            const { threadId } = message;
            const thread = state.threads[threadId];
            if (!thread) {
              console.warn(
                `Thread ${threadId} not found while trying to add/update message ${message.id}`
              );
              return;
            }
            // ... (existing logic for adding/updating and sorting) ...
            const messageIndex = thread.messages.findIndex(
              (m) => m.id === message.id
            );

            if (messageIndex >= 0) {
              // Preserve existing fields if new message is partial (e.g., during retry)
              // This might not be needed with streaming, but good practice
              thread.messages[messageIndex] = {
                ...thread.messages[messageIndex],
                ...message,
              };
            } else {
              thread.messages.push(message);
            }

            logger.info("STORE: Added/updated message:");

            thread.messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );

            thread.updatedAt = new Date().toISOString();
          });
        },

        // --- Deprecated Actions ---
        // retrySendMessage: async (messageId, threadId) => { ... }, // Remove or adapt later if needed
      };
    }),
    // --- Persist Configuration ---
    {
      name: "chat-store-v4",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
            // Potentially clear state or handle error
          }
          // Ensure rehydrated state starts with clean streaming state
          if (state) {
            state.streamingAssistantMessage = null;
            state.streamingToolData = null;
            state.connectionStatus = "idle";
            state.connectionError = null;
            state.isLoading = false; // Ensure loading is reset
            state.error = null; // Ensure general error is reset
          }
        };
      },
      merge: (persistedState, currentState) => {
        // Custom merge if needed, default is shallow merge which is usually fine
        // Ensure non-persisted parts of current state are initialized correctly
        const merged = { ...currentState, ...(persistedState as object) }; // Cast needed?
        merged.streamingAssistantMessage = null;
        merged.streamingToolData = null;
        merged.connectionStatus = "idle";
        merged.connectionError = null;
        merged.isLoading = false;
        merged.error = null;
        return merged;
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

/** Selector for the currently streaming assistant message object */
export const useStreamingAssistantMessage = (): ChatMessage | null => {
  return useChatStore((state) => state.streamingAssistantMessage);
};

/** Selector for streaming tool data (buffers, parsed JSON) */
export const useStreamingToolData = (): {
  deltaBuffers: Map<number, string>;
  partialInputStream: Map<number, PartialJsonValue>;
} | null => {
  return useChatStore((state) => state.streamingToolData);
};

/** Selector for the connection status */
export const useConnectionStatus = (): ConnectionStatus => {
  return useChatStore((state) => state.connectionStatus);
};

/** Selector for the connection error message */
export const useConnectionError = (): string | null => {
  return useChatStore((state) => state.connectionError);
};

/** Selector for any general (non-connection) error */
export const useGeneralError = (): Error | null => {
  return useChatStore((state) => state.error);
};
