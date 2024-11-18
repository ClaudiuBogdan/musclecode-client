import { CodeTab } from '@/stores/algorithm'

interface EditorTabsProps {
  activeTab: CodeTab
  onTabChange: (tab: CodeTab) => void
}

export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  return (
    <div className="flex h-9 bg-gray-900">
      {(['solution', 'test'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            px-4 h-full flex items-center gap-2 text-sm
            border-t-2 border-r border-gray-700
            hover:bg-gray-800
            ${activeTab === tab 
              ? 'bg-gray-800 border-t-blue-500 text-white' 
              : 'border-t-transparent text-gray-400'}
          `}
        >
          {tab === 'solution' ? 'Solution.ts' : 'Test.ts'}
        </button>
      ))}
    </div>
  )
} 