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
        "prose prose-sm dark:prose-invert max-w-none overflow-auto",
        "prose-headings:text-foreground dark:prose-headings:text-zinc-200",
        "prose-p:text-muted-foreground dark:prose-p:text-zinc-400",
        "prose-strong:text-foreground dark:prose-strong:text-zinc-200",
        "prose-code:text-foreground dark:prose-code:text-zinc-200",
        "prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800",
        "prose-ul:text-muted-foreground dark:prose-ul:text-zinc-400",
        "prose-li:text-muted-foreground dark:prose-li:text-zinc-400",
        "prose-blockquote:text-muted-foreground dark:prose-blockquote:text-zinc-400",
        "prose-a:text-muted-foreground dark:prose-a:text-zinc-400 hover:prose-a:text-foreground dark:hover:prose-a:text-zinc-300"
      )}
    >
      <ReactMarkdown>{problemDescription}</ReactMarkdown>
    </div>
  );
};
