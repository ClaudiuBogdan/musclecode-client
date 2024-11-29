import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { FC } from "react";

interface NotesPreviewProps {
  value: string;
}

export const NotesPreview: FC<NotesPreviewProps> = ({ value }) => {
  return (
    <div className="w-full h-full flex-1 flex overflow-auto">
      <div
        className={cn(
          "prose prose-sm",
          "max-w-[64rem]",
          "prose-code:text-foreground",
          "[&_pre]:whitespace-pre-wrap",
          "[&_*]:break-words",
          // Light mode styles
          "prose-headings:text-foreground",
          "prose-p:text-foreground",
          "prose-strong:text-foreground",
          "prose-pre:bg-secondary",
          "prose-ul:text-foreground",
          "prose-li:text-foreground",
          "prose-blockquote:text-foreground",
          "prose-a:text-primary hover:prose-a:text-primary/80",
          // Dark mode styles
          "dark:prose-invert",
          "dark:prose-headings:text-zinc-200",
          "dark:prose-p:text-zinc-300",
          "dark:prose-strong:text-zinc-200",
          "dark:prose-code:text-zinc-200",
          "dark:prose-pre:bg-zinc-800",
          "dark:prose-ul:text-zinc-300",
          "dark:prose-li:text-zinc-300",
          "dark:prose-blockquote:text-zinc-300",
          "dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300"
        )}
      >
        <div className="py-4">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
