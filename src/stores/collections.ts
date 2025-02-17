import { create } from "zustand";
import { Collection } from "@/types/collection";
import { apiClient } from "@/lib/api/client";

interface CollectionFormData {
  name: string;
  description: string;
  isPublic: boolean;
  algorithms: string[];
  tags: string[];
}

interface CollectionsState {
  publicCollections: Collection[];
  userCollections: Collection[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPublicCollections: () => Promise<void>;
  fetchUserCollections: () => Promise<void>;
  createCollection: (data: CollectionFormData) => Promise<void>;
  updateCollection: (id: string, data: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  copyCollection: (id: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  publicCollections: [],
  userCollections: [],
  isLoading: false,
  error: null,

  fetchPublicCollections: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<Collection[]>("/collections/public");
      set({ publicCollections: response.data });
    } catch (error) {
      set({ error: "Failed to fetch public collections" });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserCollections: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<Collection[]>("/collections/me");
      set({ userCollections: response.data });
    } catch (error) {
      set({ error: "Failed to fetch user collections" });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  createCollection: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.post<Collection>("/collections/me", {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      set((state) => ({
        userCollections: [...state.userCollections, response.data],
      }));
    } catch (error) {
      set({ error: "Failed to create collection" });
      console.error(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCollection: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.put<Collection>(
        `/collections/me/${id}`,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      set((state) => ({
        userCollections: state.userCollections.map((c) =>
          c.id === id ? response.data : c
        ),
      }));
    } catch (error) {
      set({ error: "Failed to update collection" });
      console.error(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCollection: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await apiClient.delete(`/collections/me/${id}`);
      set((state) => ({
        userCollections: state.userCollections.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: "Failed to delete collection" });
      console.error(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  copyCollection: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.post<Collection>(
        `/collections/public/${id}/copy`
      );
      set((state) => ({
        userCollections: [...state.userCollections, response.data],
      }));
    } catch (error) {
      set({ error: "Failed to copy collection" });
      console.error(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
