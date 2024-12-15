import {
  createLazyFileRoute,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { ExecutionResult } from "@/components/code/ExecutionResult";
import { useLayoutStore } from "@/stores/layout";
import { InfoPanel } from "@/components/code/InfoPanel";
import { TopBar } from "@/components/code/layout/TopBar";
import { ButtonBar } from "@/components/code/layout/ButtonBar";
import { Toaster } from "@/components/ui/Toaster";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeLanguage } from "@/types/algorithm";
import { useAlgorithmStore } from "@/stores/algorithm";
import {
  selectActiveLanguage,
  selectActiveTab,
  selectIsLoading,
  selectExecutionResult,
  selectIsExecuting,
  selectIsSubmitting,
  selectIsCompleted,
  selectNextAlgorithm,
  selectTimerState,
} from "@/stores/algorithm/selectors";

export const Route = createLazyFileRoute("/algorithms/$algorithmId/")({
  component: Algorithm,
});

function Algorithm() {
  const { algorithmId } = useParams({ from: "/algorithms/$algorithmId/" });
  const { tab } = useSearch({
    from: "/algorithms/$algorithmId/",
    select: (search: Record<string, unknown>) => ({
      tab: (search.tab as string) || "description",
    }),
  });
  const { sizes, editorSizes, setSizes, setEditorSizes } = useLayoutStore();

  // Selectors
  const isLoading = useAlgorithmStore(selectIsLoading);
  const error = useAlgorithmStore((state) => state.metadata.error);
  const activeLanguage = useAlgorithmStore((state) =>
    selectActiveLanguage(state, algorithmId)
  );
  const activeTab = useAlgorithmStore((state) =>
    selectActiveTab(state, algorithmId)
  );
  const executionResult = useAlgorithmStore((state) =>
    selectExecutionResult(state, algorithmId)
  );
  const isExecuting = useAlgorithmStore((state) =>
    selectIsExecuting(state, algorithmId)
  );
  const isSubmitting = useAlgorithmStore((state) =>
    selectIsSubmitting(state, algorithmId)
  );
  const isCompleted = useAlgorithmStore((state) =>
    selectIsCompleted(state, algorithmId)
  );
  const nextAlgorithm = useAlgorithmStore((state) =>
    selectNextAlgorithm(state, algorithmId)
  );
  const timerState = useAlgorithmStore((state) =>
    selectTimerState(state, algorithmId)
  );

  // Actions
  const {
    setCode,
    getFiles,
    setActiveTab: setActiveTabAction,
    runCode,
    getCode,
    resetCode,
    initializeAlgorithm,
    pauseTimer,
    startTimer,
    resumeTimer,
  } = useAlgorithmStore();

  useEffect(() => {
    const loadAlgorithm = async () => {
      await initializeAlgorithm(algorithmId);
    };
    loadAlgorithm();

    // Handle timer cleanup on unmount
    return () => {
      if (algorithmId) {
        pauseTimer(algorithmId);
      }
    };
  }, [algorithmId, initializeAlgorithm, pauseTimer]);

  const handleCodeChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;
      setCode(algorithmId, value);
    },
    [algorithmId, setCode]
  );

  const handleLanguageChange = (language: CodeLanguage) => {
    const files = getFiles(algorithmId, language);
    if (files.length > 0) {
      setActiveTabAction(algorithmId, files[0].name);
    }
  };

  const handleRunCode = useCallback(() => {
    if (!algorithmId) return;
    runCode(algorithmId);
  }, [algorithmId, runCode]);

  const handleReset = useCallback(() => {
    if (!algorithmId) return;
    resetCode(algorithmId);
  }, [algorithmId, resetCode]);

  // Timer management functions
  const handleTimerStart = useCallback(() => {
    if (!algorithmId) return;
    startTimer(algorithmId);
  }, [algorithmId, startTimer]);

  const handleTimerResume = useCallback(() => {
    if (!algorithmId) return;
    resumeTimer(algorithmId);
  }, [algorithmId, resumeTimer]);

  const handleTimerManagement = useCallback(() => {
    if (!algorithmId) return;

    if (!timerState) {
      handleTimerStart();
      return;
    }

    if (timerState.pausedAt !== null) {
      handleTimerResume();
    }
  }, [algorithmId, timerState, handleTimerStart, handleTimerResume]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-2">
            Error loading algorithm
          </div>
          <div className="text-sm text-gray-500">{error}</div>
          <button
            onClick={() => initializeAlgorithm(algorithmId)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeLanguage || !activeTab) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">
          Algorithm configuration error
        </div>
      </div>
    );
  }

  const nextAlgorithmId = nextAlgorithm?.id;
  const hasPassed = executionResult?.result?.completed ?? false;
  const currentCode = getCode(algorithmId, activeLanguage, activeTab);

  return (
    <>
      <div className="flex h-screen">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes) => {
            setSizes([sizes[0], sizes[1]]);
          }}
        >
          <ResizablePanel defaultSize={sizes[0]} minSize={25}>
            <InfoPanel algorithmId={algorithmId} tab={tab} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={sizes[1]} minSize={40}>
            <div className="flex h-full flex-col">
              <TopBar
                algorithmId={algorithmId}
                activeTab={activeTab}
                activeLanguage={activeLanguage}
                onTabChange={(tab: string) =>
                  setActiveTabAction(algorithmId, tab)
                }
                onLanguageChange={handleLanguageChange}
                getFiles={getFiles}
              />

              <ResizablePanelGroup
                direction="vertical"
                onLayout={(sizes) => {
                  setEditorSizes([sizes[0], sizes[1]]);
                }}
                className="flex-1"
              >
                <ResizablePanel defaultSize={editorSizes[0]} minSize={30}>
                  <div className="flex h-full flex-col">
                    <div className="flex-1">
                      <CodeEditor
                        initialValue={currentCode}
                        lang={activeLanguage}
                        onChange={handleCodeChange}
                        onFocus={handleTimerManagement}
                      />
                    </div>
                    <ButtonBar
                      algorithmId={algorithmId}
                      nextAlgorithmId={nextAlgorithmId}
                      hasPassed={hasPassed}
                      isExecuting={isExecuting}
                      isSubmitting={isSubmitting}
                      isCompleted={isCompleted}
                      onRun={handleRunCode}
                      onReset={handleReset}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={editorSizes[1]}
                  minSize={20}
                  className="bg-gray-900"
                >
                  <ExecutionResult
                    result={executionResult}
                    isExecuting={isExecuting}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster />
    </>
  );
}
