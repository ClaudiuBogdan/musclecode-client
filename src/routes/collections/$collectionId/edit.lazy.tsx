import { createLazyFileRoute } from '@tanstack/react-router'
import { useCollection } from '@/hooks/useCollection'
import { useAlgorithmTemplates } from '@/hooks/useAlgorithmTemplates'
import { useUpdateCollection } from '@/hooks/useUpdateCollection'
import {
  CollectionForm,
  CollectionFormData,
} from '@/components/collections/CollectionForm'
import { useNavigate } from '@tanstack/react-router'
import { createLogger } from '@/lib/logger'
import { showToast } from '@/utils/toast'
import { Loader2, AlertCircle, Search } from "lucide-react";

const logger = createLogger("EditCollectionPage");

export const Route = createLazyFileRoute("/collections/$collectionId/edit")({
  component: EditCollectionPage,
});

function EditCollectionPage() {
  const { collectionId } = Route.useParams();
  const navigate = useNavigate();

  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollection(collectionId);
  const { data: algorithmTemplates = [], isLoading: isLoadingTemplates } =
    useAlgorithmTemplates();
  const updateCollectionMutation = useUpdateCollection();

  const isLoading =
    isLoadingCollection ||
    isLoadingTemplates ||
    updateCollectionMutation.isPending;

  // Enhanced loading state
  if (isLoadingCollection || isLoadingTemplates) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="inline-block bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold tracking-tight">
              Edit Collection
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Loading collection details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (collectionError) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-destructive/10 w-fit p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
            Loading Error
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {collectionError instanceof Error
              ? collectionError.message
              : "Failed to load collection details"}
          </p>
        </div>
      </div>
    );
  }

  // Enhanced not found state
  if (!collection) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 w-fit p-4 rounded-full">
            <Search className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Collection Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The collection you're trying to edit doesn't exist or you don't have
            permission
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CollectionFormData) => {
    try {
      logger.info("Updating collection", { collectionId, data });
      await updateCollectionMutation.mutateAsync({
        id: collectionId,
        data: {
          ...data,
          // Ensure we're not sending any extra fields
          name: data.name.trim(),
          description: data.description.trim(),
          isPublic: data.isPublic,
          algorithmIds: data.algorithmIds,
          tags: data.tags.filter((tag) => tag.trim() !== ""),
        },
      });
      showToast.success("Collection updated successfully");
      navigate({ to: "/collections/$collectionId", params: { collectionId } });
    } catch (error) {
      logger.error("Failed to update collection", {
        error: error instanceof Error ? error.message : String(error),
        collectionId,
        data,
      });
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to update collection. Please try again."
      );
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
    <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-12 space-y-2">
        <div className="inline-block bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <h1 className="text-4xl font-bold tracking-tight">Edit Collection</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          Update your collection's details and curate algorithms
        </p>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-3xl rounded-xl border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60 p-6 md:p-8">
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
