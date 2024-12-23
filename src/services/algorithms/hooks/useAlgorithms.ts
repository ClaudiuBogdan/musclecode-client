import { useQuery } from "@tanstack/react-query";
import { AlgorithmPreview } from "@/types/algorithm";
import { apiClient } from "@/lib/api/client";

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
