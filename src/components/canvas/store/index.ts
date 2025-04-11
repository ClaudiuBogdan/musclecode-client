import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, ChatSession, MessageStatus } from "../types";
import { ChatStore, ChatStoreState } from "./types";
import api from "../services/chatApi";

/**
 * Initial state for the chat store
 */
const initialState: ChatStoreState = {
  sessions: {},
  currentSessionId: null,
  isLoading: false, // For initial load
  error: null,
  sessionLoadingStatus: {}, // Track loading per session
};

/**
 * Create the chat store with Zustand
 */
export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // --- Core Actions ---

      loadInitialState: async () => {
        // Avoid multiple initial loads
        if (get().isLoading || Object.keys(get().sessions).length > 0) {
          // TODO: Maybe trigger a background sync check instead of hard return?
          // console.log("Initial state already loaded or loading.");
          // return;
        }

        set({ isLoading: true, error: null });
        try {
          // Fetch sessions overview from the backend
          const remoteSessions = await api.fetchSessions(); // Assumes this fetches session metadata, maybe not all messages

          const sessionsRecord: Record<string, ChatSession> = {};
          remoteSessions.forEach((session) => {
            // Ensure messages array exists, even if backend doesn't send it in overview
            sessionsRecord[session.id] = {
              ...session,
              messages: session.messages || [],
            };
          });

          // Merge strategy: Prioritize remote data, but keep local-only sessions.
          const currentLocalSessions = get().sessions;
          const mergedSessions: Record<string, ChatSession> = {
            ...sessionsRecord,
          }; // Start with all remote sessions

          for (const localId in currentLocalSessions) {
            if (!mergedSessions[localId]) {
              // If a session exists locally but not remotely, keep the local version.
              // This could be a session created offline.
              mergedSessions[localId] = currentLocalSessions[localId];
              console.warn(
                `Keeping local-only session: ${localId}. Consider backend reconciliation.`
              );
            } else {
              // If session exists in both, remote version is already in mergedSessions.
              // Optional: More complex merge based on updatedAt timestamp if available.
              // Example: if (new Date(currentLocalSessions[localId].updatedAt) > new Date(mergedSessions[localId].updatedAt)) { mergedSessions[localId] = currentLocalSessions[localId]; }
            }
          }

          // Determine default current session
          let { currentSessionId } = get();
          const availableSessionIds = Object.keys(mergedSessions);
          if (!currentSessionId || !mergedSessions[currentSessionId]) {
            currentSessionId =
              availableSessionIds.length > 0 ? availableSessionIds[0] : null;
          }

          // Initial sync for the current session if needed
          if (currentSessionId) {
            // Don't await this, let it run in background
            get()
              ._syncSessionMessagesWithBackend(currentSessionId)
              .catch((err) => {
                console.error(
                  `Initial sync failed for session ${currentSessionId}:`,
                  err
                );
                // Optionally set a session-specific error
              });
          }

          set({
            sessions: mergedSessions,
            currentSessionId,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to load initial state:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error
                : new Error("Failed to load initial state"),
          });
        }
      },

      createSession: async (title, context) => {
        // Indicate loading potentially
        // set(state => { state.sessionLoadingStatus['new'] = true; }); // Example
        try {
          const newSessionData = {
            title: title || `New Chat ${new Date().toLocaleTimeString()}`, // Default title
            // Assume API handles createdAt, initial messages, etc.
            attachedContext: context || [],
            metadata: {}, // Add any default metadata
          };
          // Create session in the backend
          const newSession = await api.createSessionAPI(newSessionData); // Assuming API takes an object

          // Ensure messages array exists
          newSession.messages = newSession.messages || [];

          // Update local state
          set((state) => {
            state.sessions[newSession.id] = newSession;
            state.currentSessionId = newSession.id; // Switch to the new session
            // delete state.sessionLoadingStatus['new'];
          });

          return newSession;
        } catch (error) {
          console.error("Failed to create session:", error);
          set((state) => {
            state.error =
              error instanceof Error
                ? error
                : new Error("Failed to create session");
            // delete state.sessionLoadingStatus['new'];
          });
          throw error; // Re-throw for the component to handle
        }
      },

      switchSession: (sessionId) => {
        const { sessions } = get();
        if (sessions[sessionId] && sessionId !== get().currentSessionId) {
          set({ currentSessionId: sessionId });

          // Simple sync logic: Sync if messages are empty or haven't been synced recently.
          const session = sessions[sessionId];
          const needsSync =
            !session.messages ||
            session.messages.length === 0 ||
            !session.lastMessagesSyncAt;
          // TODO: Implement more robust check, e.g., time-based:
          // const syncThreshold = 5 * 60 * 1000; // 5 minutes
          // const needsSync = !session.lastMessagesSyncAt || (Date.now() - new Date(session.lastMessagesSyncAt).getTime()) > syncThreshold;

          if (needsSync) {
            get()
              ._syncSessionMessagesWithBackend(sessionId)
              .catch((error) => {
                console.error(
                  `Failed to sync messages for session ${sessionId} on switch:`,
                  error
                );
                // Optionally set a session-specific error indicator
              });
          }
        } else if (!sessions[sessionId]) {
          console.error(
            `Session with ID ${sessionId} not found for switching.`
          );
          // Optionally set an error or redirect
        }
      },

      deleteSession: async (sessionId) => {
        const originalState = { ...get() }; // Backup for rollback
        const sessionToDelete = originalState.sessions[sessionId];

        if (!sessionToDelete) {
          console.warn(
            `Attempted to delete non-existent session: ${sessionId}`
          );
          return;
        }

        // Optimistic update
        set((state) => {
          delete state.sessions[sessionId];
          if (state.currentSessionId === sessionId) {
            const remainingIds = Object.keys(state.sessions);
            state.currentSessionId =
              remainingIds.length > 0 ? remainingIds[0] : null;
          }
        });

        try {
          // Delete from backend
          await api.deleteSessionAPI(sessionId);
        } catch (error) {
          console.error("Failed to delete session from backend:", error);
          // Rollback
          set({
            sessions: originalState.sessions,
            currentSessionId: originalState.currentSessionId,
            error:
              error instanceof Error
                ? error
                : new Error("Failed to delete session"),
          });
          throw error; // Re-throw for component handling
        }
      },

      addMessage: async (sessionId, messageData) => {
        const tempId = uuidv4();
        const session = get().sessions[sessionId];

        if (!session) {
          console.error(`Session ${sessionId} not found for adding message.`);
          set({ error: new Error(`Session ${sessionId} not found`) });
          return;
        }

        const tempMessage: ChatMessage = {
          id: tempId,
          role: "user", // Explicitly user role
          content: messageData.content, // Assume messageData.content is already ContentElement[]
          createdAt: new Date().toISOString(),
          status: "in_progress" as MessageStatus,
          // Spread other fields from messageData if needed (e.g., metadata)
          ...(messageData as Partial<ChatMessage>), // Cast carefully
        };

        // Optimistic Add
        get()._addOrUpdateMessage(sessionId, tempMessage);

        try {
          // Send to backend - API expects content etc.
          const backendPayload = {
            content: messageData.content,
            // Include other relevant fields from messageData for the API
            ...(messageData as Partial<ChatMessage>),
          };
          const sentMessage = await api.sendMessageAPI(
            sessionId,
            backendPayload
          );

          // Ensure backend response has necessary fields
          sentMessage.status = "completed"; // Set status on successful return

          // Update the temporary message with the final one from backend
          get()._addOrUpdateMessage(sessionId, sentMessage, tempId);
        } catch (error) {
          console.error("Failed to send message:", error);

          // Update optimistic message to failed status
          get()._addOrUpdateMessage(sessionId, {
            ...tempMessage, // Use the original temp message data
            status: "failed",
          });

          set({
            error:
              error instanceof Error
                ? error
                : new Error("Failed to send message"),
            // Optionally add error details to the message itself via metadata?
          });
          // Decide if this should throw to notify the component
          // throw error;
        }
      },

      attachContext: (sessionId, context) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return;

          // Initialize if needed
          if (!session.attachedContext) {
            session.attachedContext = [];
          }

          const existingIndex = session.attachedContext.findIndex(
            (c) =>
              c.id === context.id || (context.unique && c.type === context.type)
          );

          if (existingIndex >= 0) {
            // If unique type exists, or same ID exists, replace it
            session.attachedContext[existingIndex] = context;
          } else {
            // Add new context
            session.attachedContext.push(context);
          }

          // TODO: Consider if this local change should trigger a backend update
          // e.g., api.updateSession(sessionId, { attachedContext: session.attachedContext });
          // This would likely require debouncing or explicit save actions.
          session.updatedAt = new Date().toISOString(); // Mark session as updated locally
        });
      },

      removeContext: (sessionId, contextId) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session || !session.attachedContext) return;

          session.attachedContext = session.attachedContext.filter(
            (c) => c.id !== contextId
          );

          // TODO: Consider backend update here too
          session.updatedAt = new Date().toISOString();
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // --- Internal Helper Implementations ---

      _addOrUpdateMessage: (sessionId, message, replaceTempId = undefined) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return;

          let messageIndex = -1;

          if (replaceTempId) {
            // Find the temporary message by its temp ID
            messageIndex = session.messages.findIndex(
              (m) => m.id === replaceTempId
            );
          } else {
            // Find message by its final/current ID
            messageIndex = session.messages.findIndex(
              (m) => m.id === message.id
            );
          }

          if (messageIndex >= 0) {
            // Replace or Update existing message
            session.messages[messageIndex] = message;
          } else if (replaceTempId && messageIndex < 0) {
            // Edge Case: Temp message to replace wasn't found, but maybe the final message
            // already arrived through another channel (e.g. websocket update). Check final ID.
            const finalIndex = session.messages.findIndex(
              (m) => m.id === message.id
            );
            if (finalIndex >= 0) {
              session.messages[finalIndex] = message; // Update the one found by final ID
            } else {
              session.messages.push(message); // Add if neither temp nor final ID found
            }
          } else {
            // Add new message if no specific replace action or existing ID found
            session.messages.push(message);
            // Sort messages after adding a new one if order isn't guaranteed by push/API
            session.messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          }

          // Optional: Sort after update/add if order might be broken
          if (messageIndex < 0) {
            // Only re-sort if added, updates maintain position
            session.messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          }
          session.updatedAt = new Date().toISOString(); // Mark session as updated
        });
      },

      _syncSessionMessagesWithBackend: async (sessionId, force = false) => {
        const session = get().sessions[sessionId];
        if (!session) return; // Should not happen if called correctly

        // Prevent concurrent syncs for the same session
        if (get().sessionLoadingStatus[sessionId] && !force) {
          console.log(`Sync already in progress for session ${sessionId}`);
          return;
        }

        // Skip sync if recently completed and not forced
        const syncThreshold = 2 * 60 * 1000; // 2 minutes
        if (
          session.lastMessagesSyncAt &&
          Date.now() - new Date(session.lastMessagesSyncAt).getTime() <
            syncThreshold &&
          !force
        ) {
          // console.log(`Skipping sync for ${sessionId}, last sync was recent.`);
          // return;
        }

        set((state) => {
          state.sessionLoadingStatus[sessionId] = true;
        });

        try {
          const remoteMessages = await api.fetchMessagesForSession(sessionId);
          const syncTime = new Date().toISOString();

          set((state) => {
            const currentSession = state.sessions[sessionId];
            if (!currentSession) return; // Session might have been deleted during fetch

            const localMessages = currentSession.messages;
            const remoteMessageMap = new Map(
              remoteMessages.map((m) => [m.id, m])
            );
            const localMessageMap = new Map(
              localMessages.map((m) => [m.id, m])
            );

            const mergedMessages: ChatMessage[] = [];
            // Use Set to ensure unique IDs from both sources are considered
            const allIds = new Set([
              ...localMessages.map((m) => m.id),
              ...remoteMessages.map((m) => m.id),
            ]);

            allIds.forEach((id) => {
              const remoteMsg = remoteMessageMap.get(id);
              const localMsg = localMessageMap.get(id);

              if (remoteMsg && localMsg) {
                // Message exists in both
                // Keep local optimistic states ('in_progress', 'failed')
                if (
                  localMsg.status === "in_progress" ||
                  localMsg.status === "failed"
                ) {
                  mergedMessages.push(localMsg);
                } else {
                  // Otherwise, prefer the remote version (source of truth for completed messages)
                  // Optional: Could merge metadata if needed
                  mergedMessages.push(remoteMsg);
                }
              } else if (remoteMsg) {
                // Only exists remotely, add it
                mergedMessages.push(remoteMsg);
              } else if (
                localMsg &&
                (localMsg.status === "in_progress" ||
                  localMsg.status === "failed")
              ) {
                // Only exists locally AND is optimistic, keep it
                mergedMessages.push(localMsg);
              }
              // Implicitly discard local-only 'completed' messages not present remotely (potentially stale)
            });

            // Sort messages by creation time
            mergedMessages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );

            currentSession.messages = mergedMessages;
            currentSession.lastMessagesSyncAt = syncTime; // Update sync timestamp
            currentSession.updatedAt = syncTime; // Also update general session update time
            state.sessionLoadingStatus[sessionId] = false; // Mark loading as done
          });
        } catch (error) {
          console.error(
            `Failed to sync messages for session ${sessionId}:`,
            error
          );
          set((state) => {
            // Keep existing messages on error? Or clear them? Depends on desired UX.
            // Set session-specific error?
            state.sessionLoadingStatus[sessionId] = false; // Ensure loading state is cleared
            // Optionally set global error too
            // state.error = error instanceof Error ? error : new Error(`Failed to sync session ${sessionId}`);
          });
          throw error; // Re-throw so caller knows about the failure
        }
      },
    })),
    // --- Persist Configuration ---
    {
      name: "chat-store-v2", // Consider changing name if state shape changes significantly
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential data to avoid storing redundant/sensitive info
        // or large message caches if they are always fetched.
        sessions: state.sessions, // CAUTION: Persisting all messages can make localStorage large.
        currentSessionId: state.currentSessionId,
        // DO NOT persist isLoading, error, sessionLoadingStatus
      }),
      // Optional: Add migration logic if upgrading from an older store version
      // version: 2,
      // migrate: (persistedState, version) => { ... migration logic ... }

      // Optional: Handle rehydration errors
      onRehydrateStorage: () => {
        console.log("Hydration finished");
        return (_, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
            // Optionally clear persisted state or handle error
          }
        };
      },
    }
  )
);

// --- Custom Hooks (Selectors) ---

/**
 * Custom hook to get the current chat session object.
 * Selects only the session object, optimizing re-renders.
 */
export const useCurrentChatSession = (): ChatSession | null => {
  return useChatStore((state) =>
    state.currentSessionId ? state.sessions[state.currentSessionId] : null
  );
};

/**
 * Custom hook to get messages ONLY from the current session.
 * Selects only the messages array, optimizing re-renders for message list components.
 * Provides a stable empty array reference if no session/messages exist.
 */
const EMPTY_MESSAGES: ChatMessage[] = [];
export const useCurrentChatMessages = (): ChatMessage[] => {
  return useChatStore((state) =>
    state.currentSessionId
      ? state.sessions[state.currentSessionId]?.messages || EMPTY_MESSAGES
      : EMPTY_MESSAGES
  );
};

/**
 * Custom hook to get the loading status for a specific session.
 */
export const useSessionLoadingStatus = (sessionId: string | null): boolean => {
  return useChatStore((state) =>
    sessionId ? !!state.sessionLoadingStatus[sessionId] : false
  );
};

/**
 * Custom hook to get all session IDs and titles for a list view.
 * Selects minimal data needed for a session list, optimizing re-renders.
 */
export const useSessionList = (): { id: string; title?: string }[] => {
  return useChatStore(
    (state) =>
      Object.values(state.sessions)
        .map((session) => ({
          id: session.id,
          title: session.title || "Untitled Chat", // Provide default
          createdAt: session.createdAt, // Maybe needed for sorting
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) // Example sort
  );
};
