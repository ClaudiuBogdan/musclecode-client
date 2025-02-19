import { createLazyFileRoute } from '@tanstack/react-router'
import { useCollection } from '@/hooks/useCollection'
import { usePublicCollections } from '@/hooks/usePublicCollections'
import { useCopyCollection } from '@/hooks/useCopyCollection'
import { useDeleteCollection } from "@/hooks/useDeleteCollection";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Pencil } from "lucide-react";
import { AlgorithmCard } from "@/components/algorithms/AlgorithmCard";
import { Skeleton } from "@/components/ui/skeleton";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";
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
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

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
      navigate({ to: "/collections" });
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
    <>
      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {collection.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {collection.description}
            </p>
          </div>

          <div className="flex gap-2">
            {isPublicCollection ? (
              <Button
                onClick={handleCopyCollection}
                disabled={copyCollectionMutation.isPending}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copyCollectionMutation.isPending
                  ? "Copying..."
                  : "Copy Collection"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    navigate({
                      to: "/collections/$collectionId/edit",
                      params: { collectionId },
                    })
                  }
                  variant="outline"
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteCollectionMutation.isPending}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteCollectionMutation.isPending
                    ? "Deleting..."
                    : "Delete Collection"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collection.algorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
          ))}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
