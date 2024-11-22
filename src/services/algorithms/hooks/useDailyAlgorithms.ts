import { AlgorithmPreview } from "@/types/algorithm";
import { useQuery } from "@tanstack/react-query";

export function useDailyAlgorithms() {
  return useQuery({
    queryKey: ["daily-algorithms"],
    queryFn: () => fetchDailyAlgorithms(),
  });
}

async function fetchDailyAlgorithms(): Promise<AlgorithmPreview[]> {
  const response = await fetch("/api/algorithms/daily");
  return response.json();
}
