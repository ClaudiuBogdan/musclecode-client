import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlgorithmTemplate,
  AlgorithmPreview,
  AlgorithmUserProgress,
} from "@/types/algorithm";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { apiClient } from "./client";

export const algorithmKeys = {
  all: ["algorithms"] as const,
  templates: ["algorithm-templates"] as const,
  userProgress: (userId: string) => ["algorithm-progress", userId] as const,
  userNotes: (userId: string) => ["algorithm-notes", userId] as const,
  dailyProgress: (userId: string, date: string) =>
    ["daily-progress", userId, date] as const,
  detail: (id: string) => [...algorithmKeys.templates, id] as const,
  userDetail: (userId: string, id: string) =>
    [...algorithmKeys.userProgress(userId), id] as const,
};

// Legacy API functions updated to use new types
export function useAlgorithms() {
  return useQuery<(AlgorithmPreview & { completed: boolean })[]>({
    queryKey: algorithmKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/algorithms/templates");
      return data;
    },
  });
}

export function useAlgorithm(id: string) {
  return useQuery<{ algorithm: AlgorithmTemplate }>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/algorithms/templates/${id}`
      );
      return data;
    },
  });
}

export function useAlgorithmData(id: string) {
  return useQuery<AlgorithmTemplate>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/algorithms/templates/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

// Template-related queries
export function useAlgorithmTemplate(id: string) {
  return useQuery<AlgorithmTemplate>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/algorithms/templates/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useAlgorithmTemplates() {
  return useQuery<AlgorithmPreview[]>({
    queryKey: algorithmKeys.templates,
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/algorithms/templates");
      return data;
    },
  });
}

// User progress-related queries
export function useAlgorithmUserProgress(userId: string, algorithmId: string) {
  return useQuery<AlgorithmUserProgress>({
    queryKey: algorithmKeys.userDetail(userId, algorithmId),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/algorithms/${algorithmId}/progress?userId=${userId}`
      );
      return data;
    },
    enabled: !!userId && !!algorithmId,
  });
}

// User notes mutations
export function useUpdateAlgorithmNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      algorithmId,
      notes,
    }: {
      userId: string;
      algorithmId: string;
      notes: string;
    }) => {
      const { data } = await apiClient.post(
        `/api/v1/algorithms/${algorithmId}/notes`,
        { userId, notes }
      );
      return data;
    },
    onSuccess: (_, { userId, algorithmId }) => {
      queryClient.invalidateQueries({
        queryKey: algorithmKeys.userDetail(userId, algorithmId),
      });
    },
  });
}

// Daily progress mutations
export function useUpdateDailyProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      algorithmId,
      date,
      completed,
    }: {
      userId: string;
      algorithmId: string;
      date: string;
      completed: boolean;
    }) => {
      const { data } = await apiClient.post(
        `/api/v1/algorithms/${algorithmId}/complete`,
        { userId, date, completed }
      );
      return data;
    },
    onSuccess: (_, { userId, algorithmId }) => {
      queryClient.invalidateQueries({
        queryKey: algorithmKeys.userDetail(userId, algorithmId),
      });
    },
  });
}

// Template management
export async function createAlgorithmTemplate(payload: CreateAlgorithmPayload) {
  const { data } = await apiClient.post<AlgorithmTemplate>(
    "/api/v1/algorithms",
    payload
  );
  return data;
}

export async function updateAlgorithmTemplate(
  id: string,
  payload: CreateAlgorithmPayload
) {
  const { data } = await apiClient.put<AlgorithmTemplate>(
    `/api/v1/algorithms/${id}`,
    payload
  );
  return data;
}

export async function getAlgorithmTemplate(id: string) {
  const { data } = await apiClient.get<AlgorithmTemplate>(
    `/api/v1/algorithms/${id}`
  );
  return data;
}
