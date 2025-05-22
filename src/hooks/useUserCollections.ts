import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

import type { Collection } from "@/types/collection";

const logger = createLogger("useUserCollections");

export function useUserCollections() {
  return useQuery({
    queryKey: ["collections", "me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Collection[]>(
          "/api/v1/collections/me"
        );
        return response.data;
      } catch (error) {
        logger.error("Failed to fetch user collections", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}
