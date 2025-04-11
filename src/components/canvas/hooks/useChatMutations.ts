import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { ChatMessage, ChatSession, ContextReference } from "../types";
import api from "../services/chatApi";
import { chatQueryKeys } from "./useChatQueries";

/**
 * Hook for creating a new chat session
 */
export const useCreateSessionMutation = (
  options?: UseMutationOptions<
    ChatSession,
    Error,
    { title?: string; context?: ContextReference[] }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, context }) => api.createSessionAPI(title, context),
    onSuccess: (newSession) => {
      // Update sessions query cache
      queryClient.setQueryData<ChatSession[]>(
        chatQueryKeys.sessions(),
        (oldSessions = []) => [...oldSessions, newSession]
      );

      // Add the new session to the individual session cache
      queryClient.setQueryData(
        chatQueryKeys.session(newSession.id),
        newSession
      );
    },
    ...options,
  });
};

/**
 * Hook for deleting a chat session
 */
export const useDeleteSessionMutation = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSessionAPI(sessionId),
    onSuccess: (_, sessionId) => {
      // Update sessions query cache
      queryClient.setQueryData<ChatSession[]>(
        chatQueryKeys.sessions(),
        (oldSessions = []) =>
          oldSessions.filter((session) => session.id !== sessionId)
      );

      // Remove the session from the individual session cache
      queryClient.removeQueries({
        queryKey: chatQueryKeys.session(sessionId),
      });

      // Remove the session's messages from cache
      queryClient.removeQueries({
        queryKey: chatQueryKeys.messages(sessionId),
      });
    },
    ...options,
  });
};

/**
 * Hook for sending a message
 */
export const useSendMessageMutation = (
  options?: UseMutationOptions<
    ChatMessage,
    Error,
    { sessionId: string; message: Omit<ChatMessage, "id" | "createdAt"> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, message }) =>
      api.sendMessageAPI(sessionId, message),
    onSuccess: (sentMessage, { sessionId }) => {
      // Update the messages for this session
      queryClient.setQueryData<ChatMessage[]>(
        chatQueryKeys.messages(sessionId),
        (oldMessages = []) => {
          // Replace any temporary message with the same content or remove it
          const filtered = oldMessages.filter((m) => m.id !== sentMessage.id);
          return [...filtered, sentMessage];
        }
      );

      // Update the session to include the new message in its list
      queryClient.setQueryData<ChatSession>(
        chatQueryKeys.session(sessionId),
        (oldSession) => {
          if (!oldSession) return undefined;

          return {
            ...oldSession,
            messages: [
              ...oldSession.messages.filter((m) => m.id !== sentMessage.id),
              sentMessage,
            ],
          };
        }
      );
    },
    ...options,
  });
};
