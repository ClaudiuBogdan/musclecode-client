import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

type Message = {
  id: string;
  text: string;
  sender: "user" | "avatar";
};

type AvatarState = {
  position: [number, number, number];
  modelUrl: string;
  isChatOpen: boolean;
  messages: Message[];
  isProcessing: boolean;
  isDragging: boolean;
  setPosition: (position: [number, number, number]) => void;
  setModelUrl: (url: string) => void;
  toggleChat: () => void;
  addMessage: (text: string, sender: "user" | "avatar") => void;
  processMessage: (text: string) => Promise<void>;
  setIsDragging: (isDragging: boolean) => void;
};

const savePositionToLocalStorage = (position: [number, number, number]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("avatarPosition", JSON.stringify(position));
  }
};

const initializePosition = (): [number, number, number] => {
  if (typeof window !== "undefined") {
    const savedPosition = localStorage.getItem("avatarPosition");
    if (savedPosition) {
      return JSON.parse(savedPosition);
    }
  }
  return [0, 0, 0];
};

export const useAvatarStore = create<AvatarState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      position: initializePosition(),
      modelUrl: "/assets/3d/duck.glb",
      isChatOpen: false,
      messages: [],
      isProcessing: false,
      isDragging: false,
      setPosition: (position) => {
        set({ position });
        savePositionToLocalStorage(position);
      },
      setModelUrl: (url) => set({ modelUrl: url }),
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      addMessage: (text, sender) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: Date.now().toString(), text, sender },
          ],
        })),
      processMessage: async (text) => {
        const { addMessage } = get();
        set({ isProcessing: true });
        addMessage(text, "user");
        try {
          const response = "Hello, how can I assist you today?";
          addMessage(response, "avatar");
        } catch (error) {
          console.error("Error processing message:", error);
          addMessage(
            "Sorry, I encountered an error while processing your message.",
            "avatar"
          );
        } finally {
          set({ isProcessing: false });
        }
      },
      setIsDragging: (isDragging) => set({ isDragging }),
    })),
    {
      name: "avatar-store",
    }
  )
);
