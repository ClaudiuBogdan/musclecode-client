import { useEffect } from "react";
import { useChatStore, useCurrentChatSession } from "../store";
import { useChatSessionsQuery, useChatMessagesQuery } from "./useChatQueries";
import {
  useCreateSessionMutation,
  useDeleteSessionMutation,
  useSendMessageMutation,
} from "./useChatMutations";
import { ChatMessage, ContentElement, ContextReference } from "../types";

/**
 * Main hook for interacting with the chat state.
 * Integrates Zustand store with React Query for backend synchronization.
 */
export const useChatState = () => {
  // Get store state and actions
  const {
    sessions,
    currentSessionId,
    isLoading,
    error,
    loadInitialState,
    createSession: createSessionAction,
    switchSession,
    deleteSession: deleteSessionAction,
    addMessage: addMessageAction,
    attachContext,
    clearError,
  } = useChatStore();

  // Get current session
  const currentSession = useCurrentChatSession();

  // Set up React Query hooks
  const { isLoading: isLoadingSessions, isFetching: isFetchingSessions } =
    useChatSessionsQuery();

  const { isLoading: isLoadingMessages, isFetching: isFetchingMessages } =
    useChatMessagesQuery(currentSessionId || "");

  // Set up mutations
  const createSessionMutation = useCreateSessionMutation();
  const deleteSessionMutation = useDeleteSessionMutation();
  const sendMessageMutation = useSendMessageMutation();

  // Initialize the store when the component mounts
  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  // Helper method to create a session and handle the mutation
  const createSession = async (
    title?: string,
    context?: ContextReference[]
  ) => {
    return await createSessionAction(title, context);
  };

  // Helper method to delete a session and handle the mutation
  const deleteSession = async (sessionId: string) => {
    return await deleteSessionAction(sessionId);
  };

  // Helper method to send a text message (most common use case)
  const sendTextMessage = async (text: string) => {
    if (!currentSessionId) {
      throw new Error("No active session");
    }

    const content: ContentElement[] = [
      {
        type: "text",
        value: text,
      },
    ];

    return await addMessageAction(currentSessionId, {
      role: "user",
      content,
    });
  };

  // Helper method to send a structured message with any content elements
  const sendMessage = async (content: ContentElement[]) => {
    if (!currentSessionId) {
      throw new Error("No active session");
    }

    return await addMessageAction(currentSessionId, {
      role: "user",
      content,
    });
  };

  // Helper to get all messages from current session
  const getCurrentMessages = (): ChatMessage[] => {
    return currentSession?.messages || [];
  };

  // Calculate the overall loading state
  const isStoreLoading =
    isLoading ||
    isLoadingSessions ||
    isLoadingMessages ||
    createSessionMutation.isPending ||
    deleteSessionMutation.isPending ||
    sendMessageMutation.isPending;

  // Calculate if store is syncing with backend
  const isSyncing = isFetchingSessions || isFetchingMessages;

  return {
    // State
    sessions,
    currentSessionId,
    currentSession,
    isLoading: isStoreLoading,
    isSyncing,
    error,

    // Actions
    createSession,
    switchSession,
    deleteSession,
    sendTextMessage,
    sendMessage,
    attachContext,
    clearError,

    // Helpers
    getCurrentMessages,
  };
};

export default useChatState;
