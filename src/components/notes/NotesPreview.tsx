import { FC } from "react";
import { MDXContent } from "../mdx/MDXContent";

interface NotesPreviewProps {
  value: string;
}

export const NotesPreview: FC<NotesPreviewProps> = ({ value }) => {
  return (
    <div className="w-full h-full flex-1 overflow-y-auto px-4 py-6">
      <MDXContent
        code={value}
        className="mx-auto"
        fallback={
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            Loading preview...
          </div>
        }
      />
    </div>
  );
};
