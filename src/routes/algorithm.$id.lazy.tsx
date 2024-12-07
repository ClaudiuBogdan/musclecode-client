import { createLazyFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { ExecutionResult } from "@/components/code/ExecutionResult";
import { useCodeStore, CodeLanguage } from "@/stores/algorithm";
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

export const Route = createLazyFileRoute("/algorithm/$id")({
  component: Algorithm,
});

function Algorithm() {
  const { id: algorithmId } = useParams({ from: "/algorithm/$id" });
  const { sizes, editorSizes, setSizes, setEditorSizes } = useLayoutStore();
  const {
    algorithms,
    isLoading,
    setCode,
    getFiles,
    setActiveTab,
    setActiveLanguage,
    runCode,
    getCode,
    resetCode,
    initializeAlgorithm,
    pauseTimer,
    startTimer,
    resumeTimer,
  } = useCodeStore();

  useEffect(() => {
    initializeAlgorithm(algorithmId);

    // Handle timer cleanup on unmount
    return () => {
      if (algorithmId) {
        pauseTimer(algorithmId);
      }
    };
  }, [algorithmId, initializeAlgorithm, pauseTimer]);

  const algorithm = algorithms[algorithmId];

  const handleCodeChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;
      setCode(algorithmId, value);
    },
    [algorithmId, setCode]
  );

  const handleLanguageChange = useCallback(
    (language: CodeLanguage) => {
      if (!algorithmId) return;
      setActiveLanguage(algorithmId, language);
    },
    [algorithmId, setActiveLanguage]
  );

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

    const timerState = algorithm?.timerState;
    if (!timerState) {
      handleTimerStart();
      return;
    }

    if (timerState.pausedAt !== null) {
      handleTimerResume();
    }
  }, [algorithmId, algorithm?.timerState, handleTimerStart, handleTimerResume]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!algorithm) {
    return <div>Algorithm not found</div>;
  }

  const nextAlgorithmId = algorithm?.nextAlgorithm?.id;
  const hasPassed = !!algorithm?.executionResult?.result.completed;
  const currentCode = getCode(
    algorithmId,
    algorithm.activeLanguage,
    algorithm.activeTab
  );

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
            <InfoPanel algorithmId={algorithmId} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={sizes[1]} minSize={40}>
            <div className="flex h-full flex-col">
              <TopBar
                algorithmId={algorithmId}
                activeTab={algorithm.activeTab}
                activeLanguage={algorithm.activeLanguage}
                onTabChange={(tab: string) => setActiveTab(algorithmId, tab)}
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
                        lang={algorithm.activeLanguage}
                        onChange={handleCodeChange}
                        onFocus={handleTimerManagement}
                      />
                    </div>
                    <ButtonBar
                      algorithmId={algorithmId}
                      nextAlgorithmId={nextAlgorithmId}
                      hasPassed={hasPassed}
                      isExecuting={algorithm.isExecuting}
                      isSubmitting={algorithm.isSubmitting}
                      isCompleted={algorithm.completed}
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
                  <ExecutionResult result={algorithm.executionResult} />
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
