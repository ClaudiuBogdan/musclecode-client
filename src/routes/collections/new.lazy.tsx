import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";

import {
  CollectionForm
} from "@/components/collections/CollectionForm";
import { useAlgorithmTemplates } from "@/hooks/useAlgorithmTemplates";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";

import type {
  CollectionFormData} from "@/components/collections/CollectionForm";
import type { Collection } from "@/types/collection";

const logger = createLogger("NewCollectionPage");

export const Route = createLazyFileRoute("/collections/new")({
  component: NewCollectionPage,
});

function NewCollectionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: algorithmTemplates = [], isLoading: isLoadingTemplates } =
    useAlgorithmTemplates();

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      const response = await apiClient.post<Collection>(
        "/api/v1/collections",
        data
      );
      return response.data;
    },
    onSuccess: (newCollection) => {
      // Invalidate user collections list
      queryClient.invalidateQueries({ queryKey: ["collections", "me"] });

      // Optimistically update the user collections cache
      queryClient.setQueryData<Collection[]>(
        ["collections", "me"],
        (oldCollections = []) => [...oldCollections, newCollection]
      );

      logger.info("Collection created successfully", {
        collectionId: newCollection.id,
      });
      showToast.success("Collection created successfully");
    },
    onError: (error) => {
      logger.error("Failed to create collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to create collection");
    },
  });

  const handleSubmit = async (data: CollectionFormData) => {
    logger.info("Creating collection");
    await createCollectionMutation.mutateAsync(data);
    void navigate({ to: "/collections" });
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Collection</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new collection of algorithms
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CollectionForm
          onSubmit={(data) => void handleSubmit(data)}
          isLoading={isLoadingTemplates || createCollectionMutation.isPending}
          availableAlgorithms={algorithmTemplates}
        />
      </div>
    </div>
  );
}
