import { createLazyFileRoute } from "@tanstack/react-router";
import { useCollectionsStore } from "@/stores/collections";
import { useCollection } from "@/hooks/useCollection";
import {
  CollectionForm,
  CollectionFormData,
} from "@/components/collections/CollectionForm";
import { useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections/$collectionId/edit")({
  component: EditCollectionPage,
});

function EditCollectionPage() {
  const { collectionId } = Route.useParams();
  const navigate = useNavigate();
  const { data: collection, isLoading: isLoadingCollection } =
    useCollection(collectionId);
  const { updateCollection, isLoading: isUpdating } = useCollectionsStore();

  if (isLoadingCollection) {
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
      await updateCollection(collectionId, data);
      navigate({ to: "/collections/$collectionId", params: { collectionId } });
    } catch (error) {
      console.error("Failed to update collection:", error);
    }
  };

  const initialData = {
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    algorithms: collection.algorithms.map((a) => a.id),
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
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
}
