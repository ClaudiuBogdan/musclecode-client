import { useQuery } from "@tanstack/react-query";
import { AlgorithmTemplate } from "@/types/algorithm";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useAlgorithmTemplates");

export function useAlgorithmTemplates() {
  return useQuery({
    queryKey: ["algorithms", "templates"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<AlgorithmTemplate[]>(
          "/api/v1/algorithms/templates"
        );
        return response.data;
      } catch (error) {
        logger.error("Failed to fetch algorithm templates", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
