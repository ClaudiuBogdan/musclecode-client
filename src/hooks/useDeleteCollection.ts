import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";
import { apiClient } from "@/lib/api/client";

const logger = createLogger("useDeleteCollection");

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await apiClient(`/api/v1/collections/${collectionId}`, {
        method: "DELETE",
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate collections queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["publicCollections"] });
    },
    onError: (error) => {
      logger.error("Failed to delete collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to delete collection");
    },
  });
}
