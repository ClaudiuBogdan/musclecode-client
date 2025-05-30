import { ResetButton } from "@/components/code/buttons/ResetButton";
import { EditorTabs } from "@/components/code/EditorTabs";
import { LanguageSelector } from "@/components/code/LanguageSelector";
import { Timer } from "@/components/code/Timer";
import { useCodeComparison } from "@/hooks/useCodeComparison";

import type { CodeLanguage } from "@/types/algorithm";

interface TopBarProps {
  algorithmId: string;
  activeTab: string;
  activeLanguage: CodeLanguage;
  onTabChange: (tab: string) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  getFiles: (
    algorithmId: string,
    language: CodeLanguage
  ) => { id: string; name: string; hidden?: boolean }[];
  onCodeReset: () => void;
  isExecuting: boolean;
  isSubmitting: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  algorithmId,
  activeTab,
  activeLanguage,
  onTabChange,
  onLanguageChange,
  getFiles,
  onCodeReset,
  isExecuting,
  isSubmitting,
}) => {
  const hasCodeChanges = useCodeComparison(algorithmId);

  return (
    <div className="flex justify-between items-center border-b border-[#1E1E1E] bg-[#1E1E1E] overflow-auto">
      <div className="flex-1">
        <EditorTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          files={getFiles(algorithmId, activeLanguage)}
          className="flex"
          tabClassName="px-3 py-1.5 text-sm flex items-center gap-2 border-r border-[#252526] hover:bg-[#2D2D2D] transition-colors duration-150"
          activeTabClassName="bg-[#1E1E1E] text-white border-t-2 border-t-blue-500"
          inactiveTabClassName="bg-[#2D2D2D] text-gray-400"
        />
      </div>
      <div className="flex items-center h-full shrink-0 border-l border-[#252526]">
        <Timer
          algorithmId={algorithmId}
          className="px-3 py-1.5 text-sm text-gray-400 border-r border-[#252526]"
        />
        <ResetButton
          onClick={onCodeReset}
          disabled={!hasCodeChanges || isExecuting || isSubmitting}
          className="px-3 border-r border-[#252526] hover:bg-[#2D2D2D] data-[state=open]:bg-[#2D2D2D]"
        />
        <LanguageSelector
          algorithmId={algorithmId}
          className="h-full px-3 py-1.5 text-sm min-w-[12rem]"
          onLanguageChange={onLanguageChange}
        />
      </div>
    </div>
  );
};