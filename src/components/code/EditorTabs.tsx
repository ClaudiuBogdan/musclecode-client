import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditorTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  files: Array<{ name: string; readOnly?: boolean }>
}

export function EditorTabs({ activeTab, onTabChange, files }: EditorTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="border-r border-gray-700">
      <TabsList className="bg-transparent border-none">
        {files.map(file => (
          <TabsTrigger
            key={file.name}
            value={file.name}
            className={`
              px-4 py-2 text-sm font-medium border-r border-gray-700 data-[state=active]:bg-gray-800 
              data-[state=active]:text-white data-[state=inactive]:text-gray-400 
              hover:data-[state=inactive]:text-gray-300
              ${file.readOnly ? 'italic' : ''}
            `}
          >
            {file.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}