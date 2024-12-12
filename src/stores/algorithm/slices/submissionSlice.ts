import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { AlgorithmState, StoreActions, SubmissionActions } from "../types";
import { Submission } from "@/types/algorithm";
import { withAlgorithm } from "../utils/stateUtils";
import { saveSubmission } from "@/lib/api/code";

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

      if (algorithm.submission.isSubmitting) {
        return false;
      }

      set((state) => {
        state.algorithms[algorithmId].submission.isSubmitting = true;
        return state;
      });

      try {
        const { activeLanguage, activeTab, storedCode } = algorithm.code;
        const code = storedCode[activeLanguage][activeTab];
        const timeSpent = get().getTotalRunningTime(algorithmId);

        const submission: Submission = {
          id: uuidv4(),
          algorithmId,
          language: activeLanguage,
          code,
          timeSpent,
          difficulty,
          notes: algorithm.submission.submissionNotes,
          createdAt: new Date().toISOString(),
        };

        await saveSubmission(algorithmId, submission);

        set((state) => {
          state.algorithms[algorithmId].submission.isSubmitting = false;
          state.algorithms[algorithmId].submission.completed = true;
          return state;
        });

        return true;
      } catch (error) {
        console.error("Failed to submit code:", error);
        set((state) => {
          state.algorithms[algorithmId].submission.isSubmitting = false;
          return state;
        });
        return false;
      }
    });
  },

  setGlobalNotes: (algorithmId, notes) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].submission.globalNotes = notes;
        return state;
      })
    ),

  setSubmissionNotes: (algorithmId, notes) =>
    set((state) =>
      withAlgorithm(state, algorithmId, (state) => {
        state.algorithms[algorithmId].submission.submissionNotes = notes;
        return state;
      })
    ),
});
