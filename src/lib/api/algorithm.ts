import { useQuery } from "@tanstack/react-query";
import { Algorithm, AlgorithmPreview } from "@/types/algorithm";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { apiClient } from "./client";

export const algorithmKeys = {
  all: ["algorithms"] as const,
  detail: (id: string) => [...algorithmKeys.all, id] as const,
};

export function useAlgorithmData(id: string) {
  return useQuery<Algorithm>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/algorithms/${id}`);
      if (!res.ok) {
        throw new Error(`Algorithm with id ${id} not found`);
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useAlgorithms() {
  return useQuery<AlgorithmPreview[]>({
    queryKey: algorithmKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/algorithms");
      if (!res.ok) {
        throw new Error("Failed to fetch algorithms");
      }
      return res.json();
    },
  });
}

export function useAlgorithm(id: string) {
  return useQuery<{ algorithm: Algorithm }>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/algorithms/${id}`);
      if (!res.ok) {
        throw new Error(`Algorithm with id ${id} not found`);
      }
      return res.json();
    },
  });
}

export async function createAlgorithm(payload: CreateAlgorithmPayload) {
  const { data } = await apiClient.post<Algorithm>("/api/algorithms", payload);
  return data;
}

export async function updateAlgorithm(
  id: string,
  payload: CreateAlgorithmPayload
) {
  const response = await fetch(`/api/algorithms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update algorithm");
  }

  return response.json();
}

export async function getAlgorithm(id: string) {
  const { data } = await apiClient.get<Algorithm>(`/api/algorithms/${id}`);
  return data;
}
