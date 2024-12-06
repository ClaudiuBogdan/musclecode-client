import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getConversationThread, findLatestLeafMessage } from "../utils/chat";
import { streamMessage } from "../lib/api/chat";
import { Message, ChatStore } from "../types/chat";

const useChatStore = create<ChatStore>((set, get) => ({
  messages: {},
  rootMessageId: null,
  activeMessageId: null,
  editingMessageId: null,

  sendMessage: async (content: string) => {
    try {
      const { activeMessageId } = get();
      const newMessageId = uuidv4();
      const userMessage: Message = {
        id: newMessageId,
        content,
        timestamp: Date.now(),
        sender: "user",
        status: "complete",
        parentId: activeMessageId,
        childrenIds: [],
      };

      set((state) => {
        const newState = {
          ...state,
          messages: { ...state.messages, [newMessageId]: userMessage },
        };
        if (activeMessageId) {
          newState.messages[activeMessageId].childrenIds.push(newMessageId);
        }
        if (!state.rootMessageId) {
          newState.rootMessageId = newMessageId;
        }
        newState.activeMessageId = newMessageId;
        return newState;
      });

      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        timestamp: Date.now(),
        sender: "assistant",
        status: "streaming",
        parentId: newMessageId,
        childrenIds: [],
      };

      set((state) => ({
        messages: { ...state.messages, [assistantMessageId]: assistantMessage },
        activeMessageId: assistantMessageId,
      }));

      const stream = await streamMessage(content);
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          get().streamToken(assistantMessageId, value);
        }
        get().completeStream(assistantMessageId);
      } catch (streamError) {
        console.error("Stream error:", streamError);
        set((state) => ({
          messages: {
            ...state.messages,
            [assistantMessageId]: {
              ...state.messages[assistantMessageId],
              status: "error",
            },
          },
        }));
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Send message error:", error);
      throw new Error("Failed to send message");
    }
  },

  startNewChat: async () => {
    set({
      messages: {},
      rootMessageId: null,
      activeMessageId: null,
      editingMessageId: null,
    });
  },

  editMessage: async (messageId: string, newContent: string) => {
    const { messages } = get();
    const message = messages[messageId];

    if (message.sender !== "user") return;

    const newMessageId = uuidv4();
    const editedMessage: Message = {
      ...message,
      id: newMessageId,
      content: newContent,
      parentId: message.id,
      childrenIds: [],
    };

    set((state) => ({
      messages: { ...state.messages, [newMessageId]: editedMessage },
      activeMessageId: newMessageId,
    }));

    // Generate new response for edited message
    await get().sendMessage(newContent);
  },

  switchBranch: (messageId: string) => {
    set({ activeMessageId: messageId });
  },

  streamToken: (messageId: string, token: string) => {
    try {
      const data = JSON.parse(token);

      set((state) => ({
        messages: {
          ...state.messages,
          [messageId]: {
            ...state.messages[messageId],
            content: state.messages[messageId].content + data.content,
          },
        },
      }));
    } catch (error) {
      console.error("Error parsing stream token:", error);
    }
  },

  completeStream: (messageId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [messageId]: { ...state.messages[messageId], status: "complete" },
      },
    }));
  },

  retryMessage: async (messageId: string) => {
    const { messages } = get();
    const message = messages[messageId];

    if (message.sender !== "assistant" || message.status !== "error") return;

    const parentMessage = messages[message.parentId!];

    set((state) => ({
      messages: {
        ...state.messages,
        [messageId]: { ...message, content: "", status: "streaming" },
      },
      activeMessageId: messageId,
    }));

    try {
      const stream = await streamMessage(parentMessage.content);
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          get().streamToken(messageId, value);
        }
        get().completeStream(messageId);
      } catch (streamError) {
        console.error("Stream error:", streamError);
        set((state) => ({
          messages: {
            ...state.messages,
            [messageId]: { ...state.messages[messageId], status: "error" },
          },
        }));
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Retry message error:", error);
      throw new Error("Failed to retry message");
    }
  },

  getConversationThread: () => {
    const { messages, activeMessageId } = get();
    return getConversationThread(messages, activeMessageId);
  },

  findLatestLeafMessage: () => {
    const { messages, rootMessageId } = get();
    return findLatestLeafMessage(messages, rootMessageId);
  },
}));

export default useChatStore;
