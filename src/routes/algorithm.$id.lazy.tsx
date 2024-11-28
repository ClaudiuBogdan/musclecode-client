import Split from '@uiw/react-split'
import { CodeEditor } from "@/components/code/CodeEditor";
import { createLazyFileRoute, useParams } from "@tanstack/react-router";
import { useCodeStore, CodeLanguage } from "@/stores/algorithm";
import { ExecutionResult } from "@/components/code/ExecutionResult";
import { useCallback, useEffect } from "react";
import { useLayoutStore } from "@/stores/layout";
import { InfoPanel } from "@/components/code/InfoPanel";
import { TopBar } from "@/components/code/layout/TopBar";
import { ButtonBar } from "@/components/code/layout/ButtonBar";

export const Route = createLazyFileRoute("/algorithm/$id")({
  component: Algorithm,
});

function Algorithm() {
  const { id: algorithmId } = useParams({ from: "/algorithm/$id" });
  const { sizes, editorSizes, setSizes, setEditorSizes } = useLayoutStore();

  const algorithm = useCodeStore((state) => state.algorithms[algorithmId]);

  const hasPassed = !!algorithm?.executionResult?.result.passed;
  const nextAlgorithmId = algorithm?.nextAlgorithm?.id;

  const {
    isLoading,
    setActiveTab,
    setCode,
    getCode,
    getFiles,
    startTimer,
    pauseTimer,
    resumeTimer,
    runCode,
    initializeAlgorithm,
  } = useCodeStore();

  // Handle timer cleanup on unmount
  useEffect(() => {
    initializeAlgorithm(algorithmId);
    return () => {
      if (algorithmId) {
        pauseTimer(algorithmId);
      }
    };
  }, [algorithmId, initializeAlgorithm, pauseTimer]);

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

  const handleCodeChange = useCallback(
    (value: string) => {
      if (!algorithmId) return;

      setCode(algorithmId, value);
      handleTimerManagement();
    },
    [algorithmId, setCode, handleTimerManagement]
  );

  const handleRunCode = async () => {
    if (!algorithmId) return;
    await runCode(algorithmId);
  };

  const handleLanguageChange = (language: CodeLanguage) => {
    setActiveTab(algorithmId, getFiles(algorithmId, language)[0].name);
  };

  const handleSubmitDifficulty = async (difficulty: number, notes?: string) => {
    // TODO: Implement the API call to submit difficulty and notes
    console.log("Submitting difficulty:", difficulty, "notes:", notes);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!algorithm) {
    return <div>Algorithm not found</div>;
  }

  const currentCode = getCode(
    algorithmId,
    algorithm.activeLanguage,
    algorithm.activeTab
  );

  return (
    <div className="h-[calc(100vh-2rem)] p-2">
      <Split
        className="h-[calc(100%-3rem)]"
        style={{ border: "1px solid #d5d5d5", borderRadius: 3 }}
        onDragEnd={(preSize, nextSize) => {
          setSizes([preSize, nextSize]);
        }}
      >
        <div
          style={{ width: `${sizes[0]}%`, minWidth: "200px" }}
          className="h-full"
        >
          <InfoPanel algorithmId={algorithmId} />
        </div>
        <div
          style={{ width: `${sizes[1]}%`, minWidth: "200px" }}
          className="h-full flex flex-col bg-gray-900"
        >
          <TopBar
            algorithmId={algorithmId}
            activeTab={algorithm.activeTab}
            activeLanguage={algorithm.activeLanguage}
            onTabChange={(tab: string) => setActiveTab(algorithmId, tab)}
            onLanguageChange={handleLanguageChange}
            getFiles={getFiles}
          />

          {/* Vertical Split for Editor and Results */}
          <Split
            className="flex-1"
            style={{ height: "calc(100% - 37px - 48px)" }} // Subtract the height of the top controls and button bar
            lineBar
            mode="vertical"
            onDragEnd={(preSize, nextSize) => {
              setEditorSizes([preSize, nextSize]);
            }}
          >
            <div
              style={{ height: `${editorSizes[0]}%`, minHeight: "100px" }}
              className="flex flex-col"
            >
              <CodeEditor
                className="h-full overflow-auto"
                initialValue={currentCode}
                lang={algorithm.activeLanguage}
                onChange={handleCodeChange}
                onFocus={handleTimerManagement}
              />

              <ButtonBar
                algorithmId={algorithmId}
                nextAlgorithmId={nextAlgorithmId}
                hasPassed={hasPassed}
                isExecuting={algorithm.isExecuting}
                onRun={handleRunCode}
                onSubmitDifficulty={handleSubmitDifficulty}
              />
            </div>
            <div
              style={{ height: `${editorSizes[1]}%`, minHeight: "100px" }}
              className="border-t border-gray-700"
            >
              <ExecutionResult result={algorithm.executionResult} />
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
}
