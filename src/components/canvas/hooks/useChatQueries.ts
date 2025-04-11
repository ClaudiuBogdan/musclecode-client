import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChatMessage, ChatSession } from "../types";
import api from "../services/chatApi";

/**
 * Query keys for chat-related queries
 */
export const chatQueryKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatQueryKeys.all, "sessions"] as const,
  session: (sessionId: string) =>
    [...chatQueryKeys.all, "session", sessionId] as const,
  messages: (sessionId: string) =>
    [...chatQueryKeys.all, "messages", sessionId] as const,
};

/**
 * Hook to fetch all chat sessions
 */
export const useChatSessionsQuery = (
  options?: UseQueryOptions<ChatSession[]>
) => {
  return useQuery({
    queryKey: chatQueryKeys.sessions(),
    queryFn: () => api.fetchSessions(),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to fetch messages for a specific session
 */
export const useChatMessagesQuery = (
  sessionId: string,
  options?: UseQueryOptions<ChatMessage[]>
) => {
  return useQuery({
    queryKey: chatQueryKeys.messages(sessionId),
    queryFn: () => api.fetchMessagesForSession(sessionId),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!sessionId, // Only run the query if sessionId is provided
    ...options,
  });
};
