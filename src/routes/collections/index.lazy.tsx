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
    <div className="container px-4 md:px-8 xl:px-0 py-8 max-w-7xl mx-auto">
      <div className="mb-10 space-y-2">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Algorithm Collections
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              Organize and curate your learning progress. Create personal
              collections or explore community-shared resources.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
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
      </div>
    </div>
  );
}
