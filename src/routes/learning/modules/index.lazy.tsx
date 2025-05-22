import { createLazyFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";

import { ContentLayout } from "@/components/learning/ContentLayout";
import { ModuleCard } from "@/components/learning/ModuleCard";
import { NoModulesAvailable } from "@/components/learning/NoModulesAvailable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useModules } from "@/services/content/hooks";

export const Route = createLazyFileRoute("/learning/modules/")({
  component: ModulesPage,
});

function ModulesPage() {
  const { data: modules, isLoading, error } = useModules();

  return (
    <ContentLayout title="Learning Modules">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-[180px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load modules. Please try again later.
          </AlertDescription>
        </Alert>
      ) : modules?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      ) : (
        <NoModulesAvailable />
      )}
    </ContentLayout>
  );
} 