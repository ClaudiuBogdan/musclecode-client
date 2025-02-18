import { createLazyFileRoute } from "@tanstack/react-router";
import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { useUserCollections } from "@/hooks/useUserCollections";
import { usePublicCollections } from "@/hooks/usePublicCollections";
import { useCopyCollection } from "@/hooks/useCopyCollection";
import { useToast } from "@/hooks/use-toast";
import { createLogger } from "@/lib/logger";

const logger = createLogger("CollectionsPage");

export const Route = createLazyFileRoute("/collections/")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const { toast } = useToast();
  const { data: publicCollections = [], isLoading: isLoadingPublic } =
    usePublicCollections();
  const { data: userCollections = [], isLoading: isLoadingUser } =
    useUserCollections();
  const copyCollectionMutation = useCopyCollection();

  const handleCopyCollection = async (id: string) => {
    try {
      logger.info("Copying collection", { collectionId: id });
      await copyCollectionMutation.mutateAsync(id);
      toast({
        title: "Collection copied",
        description: "The collection has been added to your collections.",
      });
    } catch (error) {
      logger.error("Failed to copy collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast({
        title: "Failed to copy collection",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

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
        onCopyCollection={handleCopyCollection}
        onDeleteCollection={() => {}} // We'll implement this later
        isLoading={
          isLoadingPublic || isLoadingUser || copyCollectionMutation.isPending
        }
      />
    </div>
  );
}
