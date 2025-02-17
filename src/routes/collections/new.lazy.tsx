import { createLazyFileRoute } from "@tanstack/react-router";
import { useCollectionsStore } from "@/stores/collections";
import {
  CollectionForm,
  CollectionFormData,
} from "@/components/collections/CollectionForm";
import { useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections/new")({
  component: NewCollectionPage,
});

function NewCollectionPage() {
  const navigate = useNavigate();
  const { createCollection, isLoading } = useCollectionsStore();

  const handleSubmit = async (data: CollectionFormData) => {
    try {
      await createCollection(data);
      navigate({ to: "/collections" });
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
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
        <CollectionForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
