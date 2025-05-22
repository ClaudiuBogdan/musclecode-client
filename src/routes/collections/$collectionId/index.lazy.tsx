import { createLazyFileRoute } from '@tanstack/react-router'
import { useNavigate } from "@tanstack/react-router";
import { Copy, Trash2, Pencil } from "lucide-react";
import { useState } from "react";

import { AlgorithmCard } from "@/components/algorithms/AlgorithmCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection } from '@/hooks/useCollection'
import { useCopyCollection } from '@/hooks/useCopyCollection'
import { useDeleteCollection } from "@/hooks/useDeleteCollection";
import { usePublicCollections } from '@/hooks/usePublicCollections'
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";


export const Route = createLazyFileRoute("/collections/$collectionId/")({
  component: CollectionDetailsPage,
});

const logger = createLogger("CollectionDetailsPage");

function CollectionDetailsPage() {
  const { collectionId } = Route.useParams();
  const navigate = useNavigate();
  const { data: collection, isLoading } = useCollection(collectionId);
  const { data: publicCollections = [] } = usePublicCollections();
  const copyCollectionMutation = useCopyCollection();
  const deleteCollectionMutation = useDeleteCollection();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopyCollection = async () => {
    if (!collection) return;

    try {
      logger.info("Copying collection", { collectionId: collection.id });
      await copyCollectionMutation.mutateAsync(collection.id);
      showToast.success("Collection copied");
    } catch (error) {
      logger.error("Failed to copy collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to copy collection");
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    try {
      logger.info("Deleting collection", { collectionId: collection.id });
      await deleteCollectionMutation.mutateAsync(collection.id);
      showToast.success("Collection deleted");
      void navigate({ to: "/collections" });
    } catch (error) {
      logger.error("Failed to delete collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to delete collection");
    }
  };

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
            The collection you&apos;re looking for doesn&apos;t exist or has been deleted
          </p>
        </div>
      </div>
    );
  }

  const isPublicCollection = publicCollections.some(
    (c) => c.id === collectionId
  );

  return (
    <>
      <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-4">
              {isPublicCollection ? "Public Collection" : "Personal Collection"}
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {collection.name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {collection.description ||
                "A curated set of algorithm challenges"}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            {isPublicCollection ? (
              <Button
                onClick={() => void handleCopyCollection()}
                disabled={copyCollectionMutation.isPending}
                className="gap-2 transition-all hover:shadow-md"
                size="lg"
              >
                <Copy className="h-5 w-5" />
                {copyCollectionMutation.isPending
                  ? "Copying..."
                  : "Duplicate Collection"}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    void navigate({
                      to: "/collections/$collectionId/edit",
                      params: { collectionId },
                    })
                  }
                  variant="outline"
                  className="gap-2 border-primary/30 hover:border-primary/50"
                  size="lg"
                >
                  <Pencil className="h-5 w-5" />
                  Edit Collection
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteCollectionMutation.isPending}
                  variant="destructive"
                  className="gap-2 transition-all hover:shadow-md"
                  size="lg"
                >
                  <Trash2 className="h-5 w-5" />
                  {deleteCollectionMutation.isPending
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.algorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              algorithm={algorithm}
              className="hover:scale-[1.02] transition-transform duration-200"
            />
          ))}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="backdrop-blur-md bg-background/95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              This will permanently delete the &quot;{collection.name}&quot; collection
              and remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-4">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteCollection()}
              className="bg-destructive hover:bg-destructive/90 transition-colors"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
