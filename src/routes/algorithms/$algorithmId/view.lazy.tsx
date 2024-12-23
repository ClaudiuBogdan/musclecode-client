import {
  createLazyFileRoute,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { InfoPanel } from "@/components/code/InfoPanel";
import { Notes } from "@/components/notes/Notes";
import { useEffect } from "react";
import { useAlgorithmStore } from "@/stores/algorithm";
import { selectIsLoading } from "@/stores/algorithm/selectors";

export const Route = createLazyFileRoute("/algorithms/$algorithmId/view")({
  component: AlgorithmView,
});

function AlgorithmView() {
  const { algorithmId } = useParams({
    from: "/algorithms/$algorithmId/view",
  });

  const { initializeAlgorithm } = useAlgorithmStore();
  const isLoading = useAlgorithmStore(selectIsLoading);
  const error = useAlgorithmStore((state) => state.metadata.error);

  const { tab } = useSearch({
    from: "/algorithms/$algorithmId/view",
    select: (search: Record<string, unknown>) => ({
      tab: (search.tab as string) || "submissions",
    }),
  });

  useEffect(() => {
    const loadAlgorithm = async () => {
      await initializeAlgorithm(algorithmId);
    };
    loadAlgorithm();
  }, [algorithmId, initializeAlgorithm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-6 py-6 h-full">
      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Description */}
        <Card>
          <CardContent>
            {/* TODO: fix this. The data is not loaded correctly. The store should be outside of info panel */}
            <InfoPanel
              algorithmId={algorithmId}
              tab={tab}
              className="h-[calc(100vh-5rem)] flex-1"
            />
          </CardContent>
        </Card>

        {/* TODO: Right Column - Maybe a graph here??? */}

        <div className="space-y-6">
          {/* Notes Section */}
          <Card>
            <CardContent>
              <Notes
                algorithmId={algorithmId}
                className="h-[calc(100vh-5rem)] flex-1"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
