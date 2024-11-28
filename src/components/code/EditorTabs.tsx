import React from "react";
import clsx from "clsx";
import { FileIcon } from "lucide-react";

interface EditorTabsProps {
  activeTab: string;
  files: Array<{ name: string }>;
  onTabChange: (tab: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  files,
  onTabChange,
  className,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
}) => {
  return (
    <div className={clsx("flex", className)}>
      {files.map((file) => (
        <button
          key={file.name}
          onClick={() => onTabChange(file.name)}
          className={clsx(
            tabClassName,
            "focus:outline-none",
            activeTab === file.name ? activeTabClassName : inactiveTabClassName
          )}
        >
          <FileIcon size={16} />
          {file.name}
        </button>
      ))}
    </div>
  );
};
