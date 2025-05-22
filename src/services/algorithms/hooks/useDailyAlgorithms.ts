import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

import type { DailyAlgorithm } from "@/types/algorithm";

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
