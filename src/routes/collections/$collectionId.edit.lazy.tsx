import { createLazyFileRoute } from "@tanstack/react-router";
import { useCollection } from "@/hooks/useCollection";
import { useAlgorithmTemplates } from "@/hooks/useAlgorithmTemplates";
import { useUpdateCollection } from "@/hooks/useUpdateCollection";
import {
  CollectionForm,
  CollectionFormData,
} from "@/components/collections/CollectionForm";
import { useNavigate } from "@tanstack/react-router";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";

const logger = createLogger("EditCollectionPage");

export const Route = createLazyFileRoute("/collections/$collectionId/edit")({
  component: EditCollectionPage,
});

function EditCollectionPage() {
  const { collectionId } = Route.useParams();
  const navigate = useNavigate();

  const { data: collection, isLoading: isLoadingCollection } =
    useCollection(collectionId);
  const { data: algorithmTemplates = [], isLoading: isLoadingTemplates } =
    useAlgorithmTemplates();
  const updateCollectionMutation = useUpdateCollection();

  const isLoading =
    isLoadingCollection ||
    isLoadingTemplates ||
    updateCollectionMutation.isPending;

  if (isLoadingCollection || isLoadingTemplates) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
          <p className="mt-2 text-muted-foreground">
            Loading collection details...
          </p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Collection not found</h1>
          <p className="mt-2 text-muted-foreground">
            The collection you're trying to edit doesn't exist or you don't have
            permission to edit it
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CollectionFormData) => {
    try {
      logger.info("Updating collection", { collectionId });
      await updateCollectionMutation.mutateAsync({ id: collectionId, data });
      showToast.success("Collection updated successfully");
      navigate({ to: "/collections/$collectionId", params: { collectionId } });
    } catch (error) {
      logger.error("Failed to update collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to update collection");
    }
  };

  const initialData = {
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    algorithmIds: collection.algorithms.map((a) => a.id),
    tags: collection.tags,
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
        <p className="mt-2 text-muted-foreground">
          Update your collection's details and algorithms
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CollectionForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          availableAlgorithms={algorithmTemplates}
        />
      </div>
    </div>
  );
}
