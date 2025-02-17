import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, Copy, MoreVertical } from "lucide-react";
import { Collection } from "@/types/collection";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollectionCardProps {
  collection: Collection;
  onCopy?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CollectionCard({
  collection,
  onCopy,
  onDelete,
}: CollectionCardProps) {
  const isOwner = collection.ownerId !== null;

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
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/collections/$collectionId/edit"
                  params={{ collectionId: collection.id }}
                >
                  Edit collection
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(collection.id)}
              >
                Delete collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
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
