import Split from '@uiw/react-split'
import { CodeEditor } from '@/components/code/CodeEditor'
import { ProblemDescription } from '@/components/code/ProblemDescription'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useLayoutStore, useCodeStore, useAlgorithmStore, CodeLanguage } from '@/stores/algorithm'
import { LanguageSelector } from '@/components/code/LanguageSelector'
import { ExecutionResult } from '@/components/code/ExecutionResult'
import { EditorTabs } from '@/components/code/EditorTabs'
import { Timer } from '@/components/code/Timer'
import { useCallback, useEffect } from 'react'
import { RunButton } from '@/components/code/RunButton'
import { useAlgorithmData } from '@/lib/api/algorithm'

export const Route = createLazyFileRoute('/algorithm/$id')({
  component: Algorithm,
})

function Algorithm() {
  const { id: algorithmId } = useParams({ from: '/algorithm/$id' })
  const { data, isLoading } = useAlgorithmData(algorithmId)
  const { sizes, editorSizes, setSizes, setEditorSizes } = useLayoutStore()
  const {
    activeLanguage: language,
    activeTab,
    executionResult,
    timerState,
    isInitialized,
    isRunning,
    setAlgorithmId,
    setActiveTab,
    setCode,
    getCode,
    getFiles,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    runCode,
    initializeCode,
  } = useCodeStore()

  useEffect(() => {
    if (data && !isInitialized) {
      setAlgorithmId(algorithmId)
      initializeCode(algorithmId, data.files)
      setActiveTab(getFiles(algorithmId, language)[0].name)
    }
  }, [algorithmId, data, language, isInitialized, getFiles, setAlgorithmId, initializeCode, setActiveTab])

  const currentCode = algorithmId
    ? getCode(algorithmId, language, activeTab)
    : ''

  const handleTimerStart = useCallback(() => {
    if (algorithmId) {
      startTimer(algorithmId)
    }
  }, [algorithmId, startTimer])

  const handleRunCode = async () => {
    if (!algorithmId) return

    await runCode()
  }

  const handleLanguageChange = (language: CodeLanguage) => {
    setActiveTab(getFiles(algorithmId, language)[0].name)
  }

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
              files={getFiles(algorithmId, language)}
            />
            <div className="flex-1 flex justify-center">
              <RunButton onRun={handleRunCode} isRunning={isRunning} />
            </div>
            <div className="flex items-center">
                <Timer
                  algorithmId={algorithmId}
                  timerState={timerState[algorithmId]}
                  onStart={handleTimerStart}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onReset={resetTimer}
                />
                <LanguageSelector className="px-3 h-9 flex items-center border-l border-gray-700 min-w-[12rem]" onLanguageChange={handleLanguageChange} />
            </div>
          </div>

          {/* Vertical Split for Editor and Results */}
          <Split
            className="flex-1"
            style={{ height: 'calc(100% - 37px)' }} // Subtract the height of the top controls
            lineBar
            mode="vertical"
            onDragEnd={(preSize, nextSize) => {
              setEditorSizes([preSize, nextSize])
            }}
          >
            <div style={{ height: `${editorSizes[0]}%`, minHeight: '100px' }} className="overflow-hidden">
              <CodeEditor
                className="h-full overflow-auto"
                initialValue={currentCode}
                onChange={setCode}
              />
            </div>
            <div style={{ height: `${editorSizes[1]}%`, minHeight: '100px' }} className="border-t border-gray-700">
              <ExecutionResult result={executionResult} />
            </div>
          </Split>
        </div>
      </Split>
    </div>
  )
}
