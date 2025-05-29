import { useQuery, useMutation } from "@tanstack/react-query";

import { AuthErrorCode } from "@/lib/auth/errors";

import {
  fetchModule,
  fetchModules,
  fetchLesson,
  fetchExercise,
  checkQuestionAnswer
} from "./api";

import type {
  CheckAnswerPayload,
  CheckAnswerResponse
} from "./api";
import type { AuthError } from "@/lib/auth/errors";

export function useModules() {
  return useQuery({
    queryKey: ["content", "modules"],
    queryFn: () => fetchModules(),
    retry: false,
  });
}

export function useModule(id: string) {
  return useQuery({
    queryKey: ["content", "module", id],
    queryFn: () => fetchModule(id),
    enabled: !!id,
    retry: (count, error) => {
      const errorCode = (error as AuthError).code;
      if (errorCode === AuthErrorCode.INSUFFICIENT_PERMISSIONS) {
        return false;
      }
      if (count > 3) {
        return false;
      }
      return true;
    },
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["content", "lesson", id],
    queryFn: () => fetchLesson(id),
    enabled: !!id,
    // refetchInterval: 1000, // Refetch every 1 second
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["content", "exercise", id],
    queryFn: () => fetchExercise(id),
    enabled: !!id,
  });
}

// TODO add hook to check the question

// Hook for checking a question answer
export function useCheckQuestionAnswer() {
  return useMutation<
    CheckAnswerResponse,
    Error,
    { questionId: string; payload: CheckAnswerPayload }
  >({
    mutationFn: ({ questionId, payload }) => checkQuestionAnswer(questionId, payload),
  });
}