import { createLazyFileRoute } from "@tanstack/react-router";
import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { useCollectionsStore } from "@/stores/collections";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/collections/")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const {
    publicCollections,
    userCollections,
    fetchPublicCollections,
    fetchUserCollections,
    copyCollection,
    deleteCollection,
  } = useCollectionsStore();

  useEffect(() => {
    fetchPublicCollections();
    fetchUserCollections();
  }, [fetchPublicCollections, fetchUserCollections]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and manage your algorithm collections
        </p>
      </div>

      <CollectionsGrid
        publicCollections={publicCollections}
        userCollections={userCollections}
        onCopyCollection={copyCollection}
        onDeleteCollection={deleteCollection}
      />
    </div>
  );
}
