import { createLazyFileRoute } from "@tanstack/react-router";

import { ContentLayout } from "@/components/learning/ContentLayout";
import { ModuleCard } from "@/components/learning/ModuleCard";
import { NoModulesAvailable } from "@/components/learning/NoModulesAvailable";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { useModules } from "@/services/content/hooks";

export const Route = createLazyFileRoute("/learning/modules/")({
  component: ModulesPage,
});

function ModulesPage() {
  const { data: modules, isLoading, error, refetch } = useModules();

  return (
    <ContentLayout 
      title="Learning Modules"
    >
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
        <ErrorDisplay 
          error={error}
          title="Failed to Load Modules"
          showRetry={true}
          onRetry={() => void refetch()}
        />
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