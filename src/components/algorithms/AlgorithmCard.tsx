import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlgorithmPreview } from "@/types/algorithm";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface AlgorithmCardProps {
  algorithm: AlgorithmPreview;
  className?: string;
}

export function AlgorithmCard({ algorithm, className }: AlgorithmCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/5",
        className
      )}
    >
      <CardHeader>
        <Link
          to="/algorithms/$algorithmId"
          params={{ algorithmId: algorithm.id }}
          className="text-xl font-semibold tracking-tight hover:underline"
        >
          {algorithm.title}
        </Link>
        <div className="mt-4 flex flex-wrap gap-2">
          {algorithm.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            Difficulty:{" "}
            <span
              className={
                algorithm.difficulty === "easy"
                  ? "text-green-500"
                  : algorithm.difficulty === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
              }
            >
              {algorithm.difficulty}
            </span>
          </div>
          <div>
            Categories:{" "}
            {algorithm.categories.map((category, index) => (
              <span key={category}>
                {index > 0 && ", "}
                {category}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
