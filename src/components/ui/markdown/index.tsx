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
import { ChevronRight, Expand } from "lucide-react";
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
import Callout from "./callout";
import { remarkCallouts } from "./plugins/callout-plugin";
import { CopyButton } from "../copy-button";

interface MarkdownProps {
  content: string;
  className?: string;
  disableGfm?: boolean;
  disableDetails?: boolean;
  disableMath?: boolean;
}

interface MathComponentProps {
  children: ReactNode;
}

// Separate components into their own components for better memoization
const CodeBlock: FC<
  React.PropsWithChildren<{ isDarkMode: boolean; className?: string }>
> = React.memo(({ className, children, isDarkMode, ...props }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
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
        <CopyButton onCopy={handleCopy} />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Code Preview</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <CopyButton
              onCopy={handleCopy}
              className="absolute right-4 top-4 z-20 h-8 w-8 p-2"
            />
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
  disableMath: boolean,
  disableDetails: boolean
): Components => {
  return useMemo(() => {
    // Create a base components object
    const components: Components = {
      code: (props) => <CodeBlock isDarkMode={isDarkMode} {...props} />,
      a: (props) => (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      ),
    };

    // Add custom components using the components object
    const customComponents = {
      callout: (props: {
        calloutType: string;
        title?: string;
        content: string;
        foldable?: string;
        expanded?: string;
        children: React.ReactNode;
      }) => {
        const { calloutType, title, content, foldable, expanded } = props;

        return (
          <Callout
            type={calloutType}
            title={title}
            foldable={foldable === "true"}
            expanded={expanded === "true"}
          >
            <Markdown content={content} />
          </Callout>
        );
      },
    };

    // Type assertion to add custom components
    Object.assign(components, customComponents as unknown as Components);

    if (!disableMath) {
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

    if (!disableDetails) {
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
  }, [isDarkMode, disableMath, disableDetails]);
};

export const Markdown: FC<MarkdownProps> = React.memo(
  ({
    content = "",
    className,
    disableGfm = false,
    disableDetails = false,
    disableMath = false,
  }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const plugins = useMemo(
      () => [
        ...(!disableGfm ? [remarkGfm] : []),
        ...(!disableMath ? [remarkMath] : []),
        remarkCallouts,
      ],
      [disableGfm, disableMath]
    );

    const rehypePlugins = useMemo(
      () => [rehypeRaw, ...(!disableMath ? [rehypeKatex] : [])],
      [disableMath]
    );

    const components = useMarkdownComponents(
      isDarkMode,
      disableMath,
      disableDetails
    );

    const processedContent = useMemo(
      () =>
        !disableDetails
          ? content.replace(
              /<details>([\s\S]*?)<\/details>/g,
              (match) => `\n${match}\n`
            )
          : content,
      [content, disableDetails]
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
