import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

import type { AlgorithmPreview } from "@/types/algorithm";

export function useAlgorithms() {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: () => fetchAlgorithms(),
  });
}

async function fetchAlgorithms(): Promise<AlgorithmPreview[]> {
  const response = await apiClient.get<AlgorithmPreview[]>(
    "/api/v1/algorithms/templates"
  );
  return response.data;
}
