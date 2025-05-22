import { useQuery } from "@tanstack/react-query";



import { apiClient } from "./client";

import type { AlgorithmTemplate } from "@/types/algorithm";
import type { CreateAlgorithmPayload } from "@/types/newAlgorithm";

export const algorithmKeys = {
  templates: ["algorithm-templates"] as const,
  detail: (id: string) => [...algorithmKeys.templates, id] as const,
};

export function useAlgorithm(id: string) {
  return useQuery<AlgorithmTemplate>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/algorithms/templates/${id}`
      );
      return data;
    },
  });
}

// Template management
export async function createAlgorithmTemplate(payload: CreateAlgorithmPayload) {
  const { data } = await apiClient.post<AlgorithmTemplate>(
    "/api/v1/algorithms/templates",
    payload
  );
  return data;
}

export async function updateAlgorithmTemplate(
  id: string,
  payload: CreateAlgorithmPayload
) {
  const { data } = await apiClient.put<AlgorithmTemplate>(
    `/api/v1/algorithms/templates/${id}`,
    payload
  );
  return data;
}

export async function saveNotes(algorithmId: string, notes: string) {
  const { data } = await apiClient.put<{ notes: string }>(
    `/api/v1/algorithms/practice/${algorithmId}/notes`,
    { notes }
  );
  return data;
}
