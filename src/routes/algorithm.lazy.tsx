import Split from '@uiw/react-split'
import { CodeEditor } from '@/components/code/CodeEditor'
import { ProblemDescription } from '@/components/code/ProblemDescription'
import { createLazyFileRoute } from '@tanstack/react-router'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LayoutStore {
  sizes: number[]
  setSizes: (sizes: number[]) => void
}

interface CodeStore {
  code: string
  setCode: (code: string) => void
}

const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sizes: [50, 50],
      setSizes: (sizes) => set({ sizes }),
    }),
    {
      name: 'layout-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

const useCodeStore = create<CodeStore>()(
  persist(
    (set) => ({
      code: '',
      setCode: (code) => set({ code }),
    }),
    {
      name: 'code-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const Route = createLazyFileRoute('/algorithm')({
  component: Algorithm,
})

function Algorithm() {
  const { code, setCode } = useCodeStore()
  const { sizes, setSizes } = useLayoutStore()

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
          style={{ width: `${sizes[0]}%`, minWidth: '300px' }} 
          className="h-full p-4"
        >
          <ProblemDescription />
        </div>
        <div 
          style={{ width: `${sizes[1]}%`, minWidth: '400px' }} 
          className="h-full overflow-auto"
        >
          <CodeEditor 
            className="h-full overflow-auto bg-black"
            initialValue={code}
            onChange={setCode}
          />
        </div>
      </Split>
    </div>
  )
}
