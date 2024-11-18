import Split from '@uiw/react-split'
import { CodeEditor } from '@/components/code/CodeEditor'
import { ProblemDescription } from '@/components/code/ProblemDescription'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useLayoutStore, useCodeStore } from '@/stores/algorithm'
import { LanguageSelector } from '@/components/code/LanguageSelector'
import { ExecutionResult } from '@/components/code/ExecutionResult'
import { EditorTabs } from '@/components/code/EditorTabs'
import { Timer } from '@/components/code/Timer'
import { useCallback, useEffect } from 'react'
import { RunButton } from '@/components/code/RunButton'
import { useRunCode } from '@/lib/api/code'
import { useAlgorithmData } from '@/lib/api/algorithm'

export const Route = createLazyFileRoute('/algorithm/$id')({
  component: Algorithm,
})

function Algorithm() {
  const { id: algorithmId } = useParams({ from: '/algorithm/$id' })
  const { data, isLoading } = useAlgorithmData(algorithmId)
  const { sizes, setSizes } = useLayoutStore()
  const {
    language,
    activeTab,
    executionResult,
    timerState,
    setAlgorithmId,
    setLanguage,
    setActiveTab,
    setCode,
    getCode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setExecutionResult,
    initializeCode,
  } = useCodeStore()
  const { runCode, isRunning } = useRunCode()

  useEffect(() => {
    if (data) {
      setAlgorithmId(algorithmId)
      initializeCode(algorithmId, data.files)
    }
  }, [algorithmId, data, setAlgorithmId, initializeCode])

  const currentCode = algorithmId
    ? getCode(algorithmId, language, activeTab)
    : ''

  const handleTimerStart = useCallback(() => {
    if (algorithmId) {
      startTimer(algorithmId)
    }
  }, [algorithmId, startTimer])

  const handleRunCode = useCallback(async () => {
    if (!algorithmId) return

    const code = getCode(algorithmId, language, activeTab)
    const result = await runCode({
      algorithmId,
      language,
      code,
    })

    setExecutionResult(result)
  }, [algorithmId, language, activeTab, getCode, runCode, setExecutionResult])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-[calc(100vh-2rem)] p-2">
      <Split
        className="h-[calc(100%-3rem)]"
        style={{ border: '1px solid #d5d5d5', borderRadius: 3 }}
        onDragEnd={(preSize, nextSize) => {
          setSizes([preSize, nextSize])
        }}
      >
        <div
          style={{ width: `${sizes[0]}%`, minWidth: '400px' }}
          className="h-full p-4"
        >
          <ProblemDescription />
        </div>
        <div
          style={{ width: `${sizes[1]}%`, minWidth: '400px' }}
          className="h-full flex flex-col bg-gray-900"
        >
          {/* Top Controls */}
          <div className="flex justify-between items-center border-b border-gray-700 overflow-auto">
            <EditorTabs
              activeTab={activeTab}
              onTabChange={(tab: string) => setActiveTab(tab)}
              files={Object.entries(data?.files || {}).map(([name]) => ({
                name,
              }))}
            />
            <div className="flex-1 flex justify-center">
              <RunButton onRun={handleRunCode} isRunning={isRunning} />
            </div>
            <div className="flex items-center">
              {algorithmId && (
                <Timer
                  algorithmId={algorithmId}
                  timerState={timerState[algorithmId]}
                  onStart={handleTimerStart}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onReset={resetTimer}
                />
              )}
              <div className="px-3 h-9 flex items-center border-l border-gray-700">
                <LanguageSelector value={language} onChange={setLanguage} />
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              className="h-full overflow-auto"
              initialValue={currentCode}
              onChange={setCode}
            />
          </div>

          {/* Execution Results */}
          <div className="h-48 border-t border-gray-700">
            <ExecutionResult result={executionResult} />
          </div>
        </div>
      </Split>
    </div>
  )
}
