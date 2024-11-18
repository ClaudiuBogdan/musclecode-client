import Split from '@uiw/react-split'
import { CodeEditor } from '@/components/code/CodeEditor'
import { ProblemDescription } from '@/components/code/ProblemDescription'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useLayoutStore, useCodeStore } from '@/stores/algorithm'
import { LanguageSelector } from '@/components/code/LanguageSelector'
import { ExecutionResult } from '@/components/code/ExecutionResult'
import { EditorTabs } from '@/components/code/EditorTabs'
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/algorithm')({
  component: Algorithm,
})

function Algorithm() {
  const { sizes, setSizes } = useLayoutStore()
  const {
    algorithmId,
    language,
    activeTab,
    executionResult,
    setAlgorithmId,
    setLanguage,
    setActiveTab,
    setCode,
    getCode,
  } = useCodeStore()

  useEffect(() => {
    setAlgorithmId('algorithm-1')
  }, [setAlgorithmId])

  const currentCode = algorithmId 
    ? getCode(algorithmId, language, activeTab)
    : ''

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
          <div className="flex justify-between items-center border-b border-gray-700">
            <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="px-3 h-9 flex items-center border-l border-gray-700">
              <LanguageSelector value={language} onChange={setLanguage} />
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
