import { createLazyFileRoute } from "@tanstack/react-router";
import { useCollectionsStore } from "@/stores/collections";
import { useCollection } from "@/hooks/useCollection";
import { usePublicCollections } from "@/hooks/usePublicCollections";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { AlgorithmCard } from "@/components/algorithms/AlgorithmCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createLazyFileRoute("/collections/$collectionId")({
  component: CollectionDetailsPage,
});

function CollectionDetailsPage() {
  const { collectionId } = Route.useParams();
  const { data: collection, isLoading } = useCollection(collectionId);
  const { data: publicCollections = [] } = usePublicCollections();
  const { copyCollection } = useCollectionsStore();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
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
            The collection you're looking for doesn't exist or has been deleted
          </p>
        </div>
      </div>
    );
  }

  const isPublicCollection = publicCollections.some(
    (c) => c.id === collectionId
  );

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {collection.name}
          </h1>
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        </div>

        {isPublicCollection && (
          <Button
            onClick={() => copyCollection(collection.id)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Collection
          </Button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collection.algorithms.map((algorithm) => (
          <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
        ))}
      </div>
    </div>
  );
}
