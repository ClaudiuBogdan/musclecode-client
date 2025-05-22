import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { type Model, createNewModel } from '@/types/models'

interface ModelsState {
  models: Model[];
}

interface ModelsActions {
  addModel: (model?: Partial<Omit<Model, 'id'>>) => void;
  addDefaultModel: (apiKey: string) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, updates: Partial<Omit<Model, 'id'>>) => void;
  toggleModelStatus: (id: string) => void;
  getModelById: (id: string) => Model | undefined;
  getActiveModels: () => Model[];
}

export const useModelsStore = create<ModelsState & ModelsActions>()(
  persist(
    immer((set, get) => ({
      models: [],

      addModel: (model) => {
        const newModel = createNewModel(model);
        set((state) => {
          state.models.push(newModel);
        });
      },

      addDefaultModel: (apiKey: string) => {
        if (apiKey.trim().length === 0) {
          throw new Error('API key is required');
        }
        const newModel = createNewModel({
          name: 'Gemini Flash 2.5',
          provider: 'gemini',
          model: 'gemini-2.5-flash-preview-04-17',
          apiKey,
          enabled: true,
        });
        set((state) => {
          state.models.push(newModel);
        });
      },

      removeModel: (id) => {
        set((state) => {
          state.models = state.models.filter((model) => model.id !== id);
        });
      },

      updateModel: (id, updates) => {
        set((state) => {
          const modelIndex = state.models.findIndex((model) => model.id === id);
          if (modelIndex !== -1) {
            state.models[modelIndex] = {
              ...state.models[modelIndex],
              ...updates,
            };
          }
        });
      },

      toggleModelStatus: (id) => {
        set((state) => {
          const model = state.models.find((model) => model.id === id);
          if (model) {
            model.enabled = !model.enabled;
          }
        });
      },

      getModelById: (id) => {
        return get().models.find((model) => model.id === id);
      },

      getActiveModels: () => {
        return get().models.filter((model) => model.enabled);
      },
    })),
    {
      name: 'models-storage',
    },
  ),
);