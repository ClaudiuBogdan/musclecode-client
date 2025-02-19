import { createLazyFileRoute } from "@tanstack/react-router";
import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { useUserCollections } from "@/hooks/useUserCollections";
import { usePublicCollections } from "@/hooks/usePublicCollections";
import { useCopyCollection } from "@/hooks/useCopyCollection";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";
import { useState } from "react";

const logger = createLogger("CollectionsPage");

export const Route = createLazyFileRoute("/collections/")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<"public" | "private">("private");

  const { data: publicCollections = [], isLoading: isLoadingPublic } =
    usePublicCollections({
      enabled: activeTab === "public",
    });
  const { data: userCollections = [], isLoading: isLoadingUser } =
    useUserCollections();
  const copyCollectionMutation = useCopyCollection();

  const handleCopyCollection = async (id: string) => {
    try {
      logger.info("Copying collection", { collectionId: id });
      await copyCollectionMutation.mutateAsync(id);
      showToast.success("Collection copied");
    } catch (error) {
      logger.error("Failed to copy collection", {
        error: error instanceof Error ? error.message : String(error),
      });
      showToast.error("Failed to copy collection");
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
        isLoading={
          (activeTab === "public" && isLoadingPublic) ||
          isLoadingUser ||
          copyCollectionMutation.isPending
        }
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
