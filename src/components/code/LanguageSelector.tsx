import { useAlgorithmStore } from "@/stores/algorithm";
import {
  selectActiveLanguage,
  selectCodeState,
} from "@/stores/algorithm/selectors";
import { Code2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CodeLanguage } from "@/types/algorithm";
import { useCallback, useMemo } from "react";

interface LanguageSelectorProps {
  algorithmId: string;
  className?: string;
  onLanguageChange?: (language: CodeLanguage) => void;
}

export function LanguageSelector({
  algorithmId,
  className,
  onLanguageChange,
}: LanguageSelectorProps) {
  const activeLanguage = useAlgorithmStore((state) =>
    selectActiveLanguage(state, algorithmId)
  );

  const codeState = useAlgorithmStore((state) =>
    selectCodeState(state, algorithmId)
  );

  // Memoize the languages array
  const languages = useMemo(() => {
    if (!codeState?.initialStoredCode) return [];
    return Object.keys(codeState.initialStoredCode) as CodeLanguage[];
  }, [codeState?.initialStoredCode]);

  const setActiveLanguage = useAlgorithmStore(
    (state) => state.setActiveLanguage
  );

  const handleLanguageChange = useCallback(
    (language: CodeLanguage) => {
      setActiveLanguage(algorithmId, language);
      onLanguageChange?.(language);
    },
    [algorithmId, setActiveLanguage, onLanguageChange]
  );

  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "h-full border-none rounded-none w-full",
          "bg-transparent text-gray-400",
          "hover:bg-[#2D2D2D] hover:text-gray-200",
          "transition-colors duration-150",
          "focus:outline-hidden",
          "focus-visible:outline-hidden focus-visible:bg-[#2D2D2D]",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
          className
        )}
        aria-label="Select programming language"
      >
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span>{activeLanguage ? mapLanguageLabel(activeLanguage) : ""}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-auto",
          "bg-[#1E1E1E] border-[#252526] text-gray-400 rounded-none mt-0",
          "shadow-lg shadow-black/20"
        )}
        align="start"
        alignOffset={0}
        sideOffset={0}
        avoidCollisions={false}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={cn(
              "transition-colors duration-150",
              "hover:bg-[#2D2D2D] hover:text-gray-200",
              "focus:outline-hidden",
              "focus-visible:outline-hidden focus-visible:bg-[#2D2D2D]",
              "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
              "data-highlighted:bg-[#2D2D2D] data-highlighted:text-gray-200",
              "relative pl-8"
            )}
          >
            {lang === activeLanguage && (
              <Check className="absolute left-2 h-4 w-4" />
            )}
            <div className="flex items-center gap-2">
              <span>{mapLanguageLabel(lang)}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function mapLanguageLabel(language: CodeLanguage): string {
  return language.charAt(0).toUpperCase() + language.slice(1);
}
