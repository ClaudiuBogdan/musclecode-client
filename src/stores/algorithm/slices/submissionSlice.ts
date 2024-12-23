import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { AlgorithmState, StoreActions, SubmissionActions } from "../types";
import { Submission } from "@/types/algorithm";
import { withAlgorithm } from "../utils/stateUtils";
import { saveSubmission } from "@/lib/api/code";
import { saveNotes } from "@/lib/api/algorithm";
import { debounce } from "@/lib/utils/debounce";

// Create a debounced save notes function
const debouncedSaveNotes = debounce(saveNotes, 3000);

export const createSubmissionSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  SubmissionActions
> = (set, get) => ({
  submit: async (algorithmId, difficulty) => {
    const state = get();

    return withAlgorithm(state, algorithmId, async () => {
      const algorithm = state.algorithms[algorithmId];

      if (algorithm.userProgress.isSubmitting) {
        return false;
      }

      set((state) => {
        state.algorithms[algorithmId].userProgress.isSubmitting = true;
        return state;
      });

      try {
        const { activeLanguage, activeTab, storedCode } = algorithm.code;
        const code = storedCode[activeLanguage][activeTab].content;
        const timeSpent = get().getTotalRunningTime(algorithmId);

        const submission: Submission = {
          id: uuidv4(),
          algorithmId,
          language: activeLanguage,
          code,
          timeSpent,
          rating: difficulty,
          notes: algorithm.userProgress.submissionNote,
          createdAt: new Date().toISOString(),
        };

        await saveSubmission(algorithmId, submission);

        set((state) => {
          state.algorithms[algorithmId].userProgress.isSubmitting = false;
          state.algorithms[algorithmId].userProgress.completed = true;
          return state;
        });

        return true;
      } catch (error) {
        console.error("Failed to submit code:", error);
        set((state) => {
          state.algorithms[algorithmId].userProgress.isSubmitting = false;
          return state;
        });
        return false;
      }
    });
  },

  setGlobalNotes: (algorithmId, notes) => {
    // Set initial saving state
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].userProgress.notes = {
          content: notes,
          state: "saving",
        };
        return state;
      })
    );

    // Save notes with debounce
    debouncedSaveNotes(algorithmId, notes)
      .then(() => {
        set((state) =>
          withAlgorithm(state, algorithmId, (state) => {
            state.algorithms[algorithmId].userProgress.notes = {
              content: notes,
              state: "saved",
            };
            return state;
          })
        );
      })
      .catch((error) => {
        console.error("Failed to save notes:", error);
        set((state) =>
          withAlgorithm(state, algorithmId, (state) => {
            state.algorithms[algorithmId].userProgress.notes = {
              content: notes,
              state: "error",
            };
            return state;
          })
        );
      });
  },

  setSubmissionNotes: (algorithmId, notes) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].userProgress.submissionNote = notes;
        return state;
      })
    ),
});
