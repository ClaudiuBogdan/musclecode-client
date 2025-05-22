import { Markdown } from "../ui/markdown";

import type { FC } from "react";


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
