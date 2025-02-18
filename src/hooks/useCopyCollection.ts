import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "@/types/collection";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("useCopyCollection");

export function useCopyCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await apiClient.post<Collection>(
        `api/v1/collections/${collectionId}/copy`
      );
      return response.data;
    },
    onSuccess: (newCollection) => {
      // Invalidate the user collections query to refetch
      queryClient.invalidateQueries({ queryKey: ["collections", "me"] });

      // Optimistically update the user collections cache
      queryClient.setQueryData<Collection[]>(
        ["collections", "me"],
        (oldCollections = []) => [...oldCollections, newCollection]
      );

      logger.info("Collection copied successfully", {
        collectionId: newCollection.id,
      });
    },
    onError: (error) => {
      logger.error("Failed to copy collection", {
        error: error instanceof Error ? error.message : String(error),
      });
    },
    retry: 2, // Retry failed requests up to 2 times
  });
}
