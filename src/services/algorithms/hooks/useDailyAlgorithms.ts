import { apiClient } from "@/lib/api/client";
import { AlgorithmDifficulty, AlgorithmPreview } from "@/types/algorithm";
import { useQuery } from "@tanstack/react-query";

interface DailyAlgorithm {
  id: string;
  userId: string;
  algorithmId: string;
  algorithmTitle: string;
  algorithmCategory: string;
  algorithmDifficulty: AlgorithmDifficulty;
  date: string;
  completed: boolean;
}

export function useDailyAlgorithms() {
  return useQuery({
    queryKey: ["daily-algorithms"],
    queryFn: () => fetchDailyAlgorithms(),
  });
}

async function fetchDailyAlgorithms(): Promise<AlgorithmPreview[]> {
  const { data } = await apiClient.get<DailyAlgorithm[]>(
    "/api/v1/algorithms/daily"
  );
  return data.map((dailyAlgorithm) => ({
    id: dailyAlgorithm.id,
    algorithmId: dailyAlgorithm.algorithmId,
    title: dailyAlgorithm.algorithmTitle,
    category: dailyAlgorithm.algorithmCategory,
    difficulty: dailyAlgorithm.algorithmDifficulty,
    completed: dailyAlgorithm.completed,
  }));
}
