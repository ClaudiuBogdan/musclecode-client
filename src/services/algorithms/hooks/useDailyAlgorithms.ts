import { apiClient } from "@/lib/api/client";
import { DailyAlgorithm } from "@/types/algorithm";
import { useQuery } from "@tanstack/react-query";

export function useDailyAlgorithms() {
  return useQuery({
    queryKey: ["daily-algorithms"],
    queryFn: () => fetchDailyAlgorithms(),
  });
}

async function fetchDailyAlgorithms(): Promise<DailyAlgorithm[]> {
  const { data } = await apiClient.get<DailyAlgorithm[]>(
    "/api/v1/algorithms/daily"
  );
  return data;
}
