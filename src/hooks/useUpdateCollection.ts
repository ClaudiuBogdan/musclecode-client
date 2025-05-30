import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

import type { CollectionFormData } from "@/components/collections/CollectionForm";
import type { Collection } from "@/types/collection";

const logger = createLogger("useUpdateCollection");

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CollectionFormData;
    }) => {
      const response = await apiClient.put<Collection>(
        `/api/v1/collections/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedCollection) => {
      // Invalidate the specific collection query
      queryClient.invalidateQueries({
        queryKey: ["collections", updatedCollection.id],
      });

      // Invalidate user collections list
      queryClient.invalidateQueries({
        queryKey: ["collections", "me"],
      });

      logger.info("Collection updated successfully", {
        collectionId: updatedCollection.id,
      });
    },
    onError: (error) => {
      logger.error("Failed to update collection", {
        error: error instanceof Error ? error.message : String(error),
      });
    },
  });
}
