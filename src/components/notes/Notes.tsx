import { FC, useCallback, useState } from "react";
import { NotesEditor } from "./NotesEditor";
import { NotesPreview } from "./NotesPreview";
import { NotesToolbar } from "./NotesToolbar";

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
}

export const Notes: FC<NotesProps> = ({ value, onChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleTogglePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  const handleToolbarAction = useCallback(
    (action: string) => {
      if (showPreview) return;
      let insertion = "";
      switch (action) {
        case "bold":
          insertion = "**bold text**";
          break;
        case "italic":
          insertion = "*italic text*";
          break;
        case "list":
          insertion = "\n- list item";
          break;
        case "link":
          insertion = "[link text](url)";
          break;
        case "image":
          insertion = "![alt text](image url)";
          break;
        case "code":
          insertion = "```\ncode block\n```";
          break;
      }
      onChange(value + insertion);
    },
    [value, onChange, showPreview]
  );

  return (
    <div className="h-full w-full flex flex-col">
      <NotesToolbar
        onAction={handleToolbarAction}
        showPreview={showPreview}
        onTogglePreview={handleTogglePreview}
      />
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <NotesPreview value={value} />
        ) : (
          <NotesEditor value={value} onChange={onChange} />
        )}
      </div>
    </div>
  );
};
