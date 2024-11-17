import { CodeEditor } from '@/components/code/CodeEditor'
import { ProblemDescription } from '@/components/code/ProblemDescription'
import { createLazyFileRoute } from '@tanstack/react-router'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


interface CodeStore {
  code: string
  setCode: (code: string) => void
}

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

  return (
    <div className="p-2">
      <h3>Welcome Algorithm!</h3>
      <div className="mt-4">

        <ProblemDescription />
        
        <CodeEditor 
          initialValue={code}
          onChange={setCode}
        />
      </div>
    </div>
  )
}
