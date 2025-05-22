import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useCopyCollection } from "@/hooks/useCopyCollection";
import { usePublicCollections } from "@/hooks/usePublicCollections";
import { useUserCollections } from "@/hooks/useUserCollections";
import { createLogger } from "@/lib/logger";
import { showToast } from "@/utils/toast";

const logger = createLogger("CollectionsPage");

export const Route = createLazyFileRoute("/collections/")({
  component: CollectionsPage,
});

export function CollectionsPage() {
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
    <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
      <Card className="rounded-xl border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60 shadow-2xs">
        <CardHeader className="p-6 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Algorithm Collections
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Organize and curate your learning progress. Create personal
              collections or explore community-shared resources.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
