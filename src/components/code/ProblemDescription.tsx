import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"

interface ProblemDescriptionProps {
  problemDescription: string;
}

export const ProblemDescription: FC<ProblemDescriptionProps> = ({
  problemDescription,
}) => {
  return (
    <div
      className={cn(
        "p-4",
        "prose prose-sm max-w-none overflow-auto",
        // Light mode styles
        "prose-headings:text-foreground",
        "prose-p:text-foreground",
        "prose-strong:text-foreground",
        "prose-code:text-foreground",
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
      <ReactMarkdown>{problemDescription}</ReactMarkdown>
    </div>
  );
};
