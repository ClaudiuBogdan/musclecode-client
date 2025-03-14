import React, { FC, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { detectLanguage, cleanTheme } from "@/lib/code-detection";
import { useTheme } from "@/components/theme/theme-provider";
import "katex/dist/katex.min.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizQuestion from "@/components/QuizQuestion";
import { motion, AnimatePresence } from "framer-motion";

interface MarkdownProps {
  content: string;
  className?: string;
  enableGfm?: boolean;
  enableRaw?: boolean;
  enableDetails?: boolean;
  enableMath?: boolean;
}

interface MathComponentProps {
  children: ReactNode;
}

// Separate components into their own components for better memoization
const CodeBlock: FC<
  React.PropsWithChildren<{ isDarkMode: boolean; className?: string }>
> = React.memo(({ className, children, isDarkMode, ...props }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };
  const content = String(children);
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && !className;

  const customStyles = useMemo(() => {
    return {
      margin: 0,
      height: "100%",
      overflow: "auto",
      fontSize: "0.875rem",
      lineHeight: 1.5,
      backgroundColor: "inherit",
      color: isDarkMode ? "#d4d4d4" : "#1e1e1e",
      boxSizing: "border-box" as const,
    };
  }, [isDarkMode]);

  const style = useMemo(() => {
    return {
      ...(isDarkMode ? vscDarkPlus : vs),
      ...cleanTheme,
    };
  }, [isDarkMode]);

  if (isInline) {
    return (
      <code
        className={cn(
          "rounded px-1.5 py-0.5 font-mono text-sm",
          "border border-accent/30"
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className={cn("relative my-2 font-mono text-sm group rounded-md")}>
      <div className="absolute right-2 top-2 flex gap-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-background"
          onClick={() => setIsDialogOpen(true)}
        >
          <Expand className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-background"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            key="copied-feedback"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 top-2 right-14 bg-accent text-accent-foreground border border-accent-foreground/30 text-xs p-2 rounded shadow"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Code Preview</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 z-20 h-8 w-8 p-2"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <SyntaxHighlighter
              language={detectLanguage(content)}
              style={style}
              PreTag="div"
              showLineNumbers={true}
              customStyle={customStyles}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </DialogContent>
      </Dialog>

      <SyntaxHighlighter
        language={detectLanguage(content)}
        style={style}
        PreTag="div"
        showLineNumbers={false}
        customStyle={customStyles}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

// Create a custom hook for markdown components
const useMarkdownComponents = (
  isDarkMode: boolean,
  enableMath: boolean,
  enableDetails: boolean
): Components => {
  return useMemo(() => {
    const components: Components = {
      code: (props) => <CodeBlock isDarkMode={isDarkMode} {...props} />,
      a: (props) => (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      ),
    };

    if (enableMath) {
      Object.assign(components, {
        math: ({ children }: MathComponentProps) => (
          <span className="my-4 [&>.katex]:text-base [&>.katex]:block">
            {children}
          </span>
        ),
        inlineMath: ({ children }: MathComponentProps) => (
          <span className="[&>.katex]:text-sm [&>.katex]:inline">
            {children}
          </span>
        ),
        mi: ({ children }: MathComponentProps) => (
          <span className="katex-mathml">{children}</span>
        ),
        mo: ({ children }: MathComponentProps) => (
          <span className="katex-mathml">{children}</span>
        ),
        mn: ({ children }: MathComponentProps) => (
          <span className="katex-mathml">{children}</span>
        ),
        mrow: ({ children }: MathComponentProps) => (
          <span className="katex-mathml">{children}</span>
        ),
        semantics: () => null,
        annotation: () => null,
      });
    }

    if (enableDetails) {
      Object.assign(components, {
        details: ({ children, ...props }: { children: ReactNode }) => (
          <details
            className={cn(
              "group border rounded-xl my-4",
              "transition-all duration-300 ease-out",
              "[&[open]>summary>svg]:rotate-90",
              "[&[open]>div]:animate-in [&[open]>div]:fade-in-0 [&[open]>div]:slide-in-from-top-2",
              "[&:not([open])>div]:animate-out [&:not([open])>div]:fade-out-0 [&:not([open])>div]:slide-out-to-top-2",
              isDarkMode
                ? "border-zinc-700 hover:border-zinc-500"
                : "border-border hover:border-primary"
            )}
            {...props}
          >
            {children}
          </details>
        ),
        summary: ({ children, ...props }: { children: ReactNode }) => (
          <summary
            className={cn(
              "flex items-center gap-3 cursor-pointer py-4 px-4",
              "transition-all duration-200 ease-out",
              "hover:bg-accent/50 active:bg-accent/70",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              "list-none [&::-webkit-details-marker]:hidden"
            )}
            {...props}
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200",
                "text-muted-foreground"
              )}
            />
            <Markdown content={String(children).trim()} />
          </summary>
        ),
      });
    }

    // Custom components
    Object.assign(components, {
      "quiz-question": QuizQuestion,
    });

    return components;
  }, [isDarkMode, enableMath, enableDetails]);
};

export const Markdown: FC<MarkdownProps> = React.memo(
  ({
    content,
    className,
    enableGfm = true,
    enableRaw = true,
    enableDetails = true,
    enableMath = true,
  }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const plugins = useMemo(
      () => [
        ...(enableGfm ? [remarkGfm] : []),
        ...(enableMath ? [remarkMath] : []),
      ],
      [enableGfm, enableMath]
    );

    const rehypePlugins = useMemo(
      () => [
        ...(enableRaw ? [rehypeRaw] : []),
        ...(enableMath ? [rehypeKatex] : []),
      ],
      [enableRaw, enableMath]
    );

    const components = useMarkdownComponents(
      isDarkMode,
      enableMath,
      enableDetails
    );

    const processedContent = useMemo(
      () =>
        enableDetails
          ? content.replace(
              /<details>([\s\S]*?)<\/details>/g,
              (match) => `\n${match}\n`
            )
          : content,
      [content, enableDetails]
    );

    return (
      <div
        className={cn(
          "prose prose-sm max-w-none",
          // Light mode styles
          "prose-headings:text-foreground",
          "prose-p:text-foreground",
          "prose-strong:text-foreground",
          "prose-code:text-foreground",
          "prose-code:before:content-[''] prose-code:after:content-['']",
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
          "dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={plugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }
);

Markdown.displayName = "Markdown";
