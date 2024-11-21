import { useQuery } from "@tanstack/react-query";
import { AlgorithmPreview } from "@/types/algorithm";

export function useAlgorithms() {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: () => fetchAlgorithms(),
  });
}

async function fetchAlgorithms(): Promise<AlgorithmPreview[]> {
  const response = await fetch("/api/algorithms");
  return response.json();
}
