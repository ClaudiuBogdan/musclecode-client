import { Loader2, AlertCircle } from "lucide-react";

import { useAlgorithms } from "@/services/algorithms/hooks/useAlgorithms";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";

export function AlgorithmsTable() {
  const { data: algorithms, isLoading, error } = useAlgorithms();

  return (
    <div className="container px-4 md:px-8 py-12 max-w-7xl mx-auto">
      <Card className="rounded-xl border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60 shadow-2xs">
        <CardHeader className="p-6 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Algorithm Challenges
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Master essential algorithms with interactive challenges and
              AI-powered guidance
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {isLoading && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading algorithms...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-32 text-destructive">
              <AlertCircle className="mr-2 h-6 w-6" />
              Error loading algorithms: {error.message}
            </div>
          )}
          {algorithms && (
            <DataTable data={algorithms} columns={columns} className="mt-6" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
