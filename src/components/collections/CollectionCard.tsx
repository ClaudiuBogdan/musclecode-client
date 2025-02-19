import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, Copy } from "lucide-react";
import { Collection } from "@/types/collection";
import { Link } from "@tanstack/react-router";

interface CollectionCardProps {
  collection: Collection;
  isOwner: boolean;
  onCopy?: (id: string) => void;
}

export function CollectionCard({
  collection,
  isOwner,
  onCopy,
}: CollectionCardProps) {
  return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/5">
          <CardHeader className="relative">
            <Badge
              variant={collection.isPublic ? "secondary" : "outline"}
              className="absolute right-4 top-4 gap-1"
            >
              {collection.isPublic ? (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </Badge>
            <Link
              to="/collections/$collectionId"
              params={{ collectionId: collection.id }}
              className="text-xl font-semibold tracking-tight hover:underline"
            >
              {collection.name}
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          </CardHeader>

          <CardFooter className="flex justify-between">
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onCopy?.(collection.id)}
              >
                <Copy className="h-4 w-4" />
                Copy collection
              </Button>
            )}
          </CardFooter>
        </Card>
      );
}
