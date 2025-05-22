import { Link } from "@tanstack/react-router";
import { Globe, Lock, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CollectionCard } from "./CollectionCard";

import type { Collection } from "@/types/collection";



interface CollectionsGridProps {
  publicCollections: Collection[];
  userCollections: Collection[];
  onCopyCollection: (id: string) => void;
  isLoading?: boolean;
  activeTab?: "public" | "private";
  onTabChange?: (tab: "public" | "private") => void;
}

function CollectionCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-2xs">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="p-6 border-t">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

export function CollectionsGrid({
  publicCollections,
  userCollections,
  onCopyCollection,
  isLoading,
  activeTab = "private",
  onTabChange,
}: CollectionsGridProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<
    "public" | "private"
  >(activeTab);

  const currentTab = onTabChange ? activeTab : internalActiveTab;
  const handleTabChange = (value: string) => {
    const tab = value as "public" | "private";
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="private" className="gap-2">
                <Lock className="h-4 w-4" />
                My Collections
              </TabsTrigger>
              <TabsTrigger value="public" className="gap-2">
                <Globe className="h-4 w-4" />
                Public Collections
              </TabsTrigger>
            </TabsList>

            {currentTab === "private" && (
              <Button asChild>
                <Link to="/collections/new" className="gap-2 dark:text-white">
                  <Plus className="h-4 w-4" />
                  New Collection
                </Link>
              </Button>
            )}
          </div>

          <TabsContent value="public" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CollectionCardSkeleton key={i} />
                ))}
              </div>
            ) : publicCollections.length === 0 ? (
              <EmptyState
                title="No public collections"
                description="Check back later for new collections"
                icon={Globe}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publicCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    isOwner={false}
                    onCopy={onCopyCollection}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="private" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CollectionCardSkeleton key={i} />
                ))}
              </div>
            ) : userCollections.length === 0 ? (
              <EmptyState
                title="No collections yet"
                description="Create your first collection or copy a public one"
                icon={Lock}
                action={
                  <Button asChild>
                    <Link to="/collections/new" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Collection
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
