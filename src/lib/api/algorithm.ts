import { useQuery } from "@tanstack/react-query";
import { Algorithm, AlgorithmPreview } from "@/types/algorithm";

export const algorithmKeys = {
  all: ["algorithms"] as const,
  detail: (id: string) => [...algorithmKeys.all, id] as const,
};

export function useAlgorithmData(id: string) {
  return useQuery<Algorithm>({
    queryKey: algorithmKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/algorithm/${id}`);
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
