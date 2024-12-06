import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiCplusplus,
  SiC,
  SiGo,
  SiRust,
  SiSwift,
  SiKotlin,
  SiPhp,
  SiScala,
  SiHaskell,
} from "react-icons/si";
import { IconType } from "react-icons";
import { FileIcon } from "lucide-react";

interface LanguageBadgeProps {
  language: string;
}

const languageIcons: Record<string, IconType> = {
  python: SiPython,
  javascript: SiJavascript,
  typescript: SiTypescript,
  ruby: SiRuby,
  cpp: SiCplusplus,
  "c++": SiCplusplus,
  c: SiC,
  go: SiGo,
  golang: SiGo,
  rust: SiRust,
  swift: SiSwift,
  kotlin: SiKotlin,
  php: SiPhp,
  scala: SiScala,
  haskell: SiHaskell,
};

export function LanguageBadge({ language }: LanguageBadgeProps) {
  const Icon = languageIcons[language.toLowerCase()] || FileIcon;

  return (
    <div className="flex items-center space-x-2 px-2 py-1">
      <Icon className="w-4 h-4" />
      <span>{language}</span>
    </div>
  );
}
