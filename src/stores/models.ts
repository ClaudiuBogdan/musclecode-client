import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { type Model, createNewModel } from '@/types/models'

interface ModelsState {
  models: Model[];
}

interface ModelsActions {
  addModel: (model?: Partial<Omit<Model, 'id'>>) => void;
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