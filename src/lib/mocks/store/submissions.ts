import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Submission } from "@/types/algorithm";

type AlgorithmId = string;

interface SubmissionState {
  submissions: Record<AlgorithmId, Submission[]>;
  addSubmission: (algorithmId: AlgorithmId, submission: Submission) => void;
  getSubmission: (algorithmId: AlgorithmId) => Submission[];
  getSubmissions: () => Submission[];
}

export const mockedSubmissionsStore = create<SubmissionState>()(
  persist(
    (set, get) => ({
      submissions: {},
      addSubmission: (algorithmId, submission) => {
        const prevSubmissions = get().submissions[algorithmId] ?? [];
        set((state) => ({
          submissions: {
            ...state.submissions,
            [algorithmId]: [...prevSubmissions, submission],
          },
        }));
      },
      getSubmission: (algorithmId) => get().submissions[algorithmId] ?? [],
      getSubmissions: () => Object.values(get().submissions).flat(),
    }),
    {
      name: "mocked-submissions-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
