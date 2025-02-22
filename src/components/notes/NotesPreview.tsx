import { FC } from "react";
import { Markdown } from "../ui/markdown";

interface NotesPreviewProps {
  value: string;
}

export const NotesPreview: FC<NotesPreviewProps> = ({ value }) => {
  return (
    <div className="w-full h-full flex-1 flex overflow-auto">
      <Markdown content={value} />
    </div>
  );
};
