import { v4 as uuidv4 } from "uuid";


import { saveNotes } from "@/lib/api/algorithm";
import { saveSubmission } from "@/lib/api/code";
import { createLogger } from "@/lib/logger";
import { debounce } from "@/lib/utils/debounce";

import { withAlgorithm } from "../utils/stateUtils";

import type { AlgorithmState, StoreActions, SubmissionActions } from "../types";
import type { Submission } from "@/types/algorithm";
import type { StateCreator } from "zustand";

const logger = createLogger({ context: "SubmissionSlice" });

// Create a debounced save notes function
const debouncedSaveNotes = debounce(saveNotes, 1000);

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
        const { activeLanguage, storedCode } = algorithm.code;
        const files = Object.values(storedCode[activeLanguage]).filter(
          (file) => !file.hidden
        );
        const timeSpent = get().getTotalRunningTime(algorithmId);

        const submission: Submission = {
          id: uuidv4(),
          algorithmId,
          language: activeLanguage,
          files,
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
        logger.error("Code Submission Failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          algorithmId,
        });
        set((state) => {
          state.algorithms[algorithmId].userProgress.isSubmitting = false;
          state.metadata.error =
            error instanceof Error ? error.message : "Failed to submit code";
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
        logger.error("Notes Save Failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          algorithmId,
        });
        set((state) =>
          withAlgorithm(state, algorithmId, (state) => {
            state.algorithms[algorithmId].userProgress.notes = {
              content: notes,
              state: "error",
            };
            state.metadata.error =
              error instanceof Error ? error.message : "Failed to save notes";
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
