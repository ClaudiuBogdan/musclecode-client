import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Plus } from "lucide-react";
import { CollectionCard } from "./CollectionCard";
import { Collection } from "@/types/collection";
import { Link } from "@tanstack/react-router";

interface CollectionsGridProps {
  publicCollections: Collection[];
  userCollections: Collection[];
  onCopyCollection: (id: string) => void;
  onDeleteCollection: (id: string) => void;
}

export function CollectionsGrid({
  publicCollections,
  userCollections,
  onCopyCollection,
  onDeleteCollection,
}: CollectionsGridProps) {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "public" | "private")}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="public" className="gap-2">
                <Globe className="h-4 w-4" />
                Public Collections
              </TabsTrigger>
              <TabsTrigger value="private" className="gap-2">
                <Lock className="h-4 w-4" />
                My Collections
              </TabsTrigger>
            </TabsList>

            {activeTab === "private" && (
              <Button asChild>
                <Link to="/collections/new" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Collection
                </Link>
              </Button>
            )}
          </div>

          <TabsContent value="public" className="mt-6">
            {publicCollections.length === 0 ? (
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
                    onCopy={onCopyCollection}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="private" className="mt-6">
            {userCollections.length === 0 ? (
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
                    onDelete={onDeleteCollection}
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
