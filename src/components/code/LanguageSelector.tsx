import { CodeLanguage, useCodeStore } from '@/stores/algorithm';
import { Code2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  className?: string;
  onLanguageChange?: (language: CodeLanguage) => void;
}


export function LanguageSelector({ className, onLanguageChange }: LanguageSelectorProps) {
  const { activeLanguage, languages, setActiveLanguage } = useCodeStore();

  const handleLanguageChange = (language: CodeLanguage) => {
    setActiveLanguage(language);
    onLanguageChange?.(language);
  };

  if (languages.length === 0) {
    return null;
  }

  return (
    <Select value={activeLanguage} onValueChange={handleLanguageChange} >
      <SelectTrigger className={cn("bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 focus:ring-offset-gray-900", className)}>
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
        {languages.map((lang) => (
          <SelectItem 
            key={lang} 
            value={lang}
            className="hover:bg-gray-750 focus:bg-gray-750"
          >
            <div className="flex items-center gap-2">
              <span>{mapLanguageLabel(lang)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function mapLanguageLabel(language: CodeLanguage) {
  return language.charAt(0).toUpperCase() + language.slice(1);
}