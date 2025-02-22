import { FC, ReactNode } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { detectLanguage, cleanTheme } from "@/lib/code-detection";
import { useTheme } from "@/components/theme/theme-provider";
import "katex/dist/katex.min.css";

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

export const Markdown: FC<MarkdownProps> = ({
  content,
  className,
  enableGfm = true,
  enableRaw = true,
  enableDetails = true,
  enableMath = true,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const plugins = [
    ...(enableGfm ? [remarkGfm] : []),
    ...(enableMath ? [remarkMath] : []),
  ];

  const rehypePlugins = [
    ...(enableRaw ? [rehypeRaw] : []),
    ...(enableMath ? [rehypeKatex] : []),
  ];

  const baseComponents: Components = {
    code({ className, children, ...props }) {
      const content = String(children);
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match && !className;

      const style = {
        ...(isDarkMode ? vscDarkPlus : vs),
        ...cleanTheme,
      };

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
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 opacity-100 md:opacity-0 transition-opacity group-hover:opacity-100 z-10 text-muted-foreground hover:bg-background"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <SyntaxHighlighter
            language={detectLanguage(content)}
            style={style}
            PreTag="div"
            showLineNumbers={false}
            customStyle={{
              overflowX: "auto",
              padding: "0.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              backgroundColor: "inherit",
              color: isDarkMode ? "#d4d4d4" : "#1e1e1e",
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  const mathComponents: Components = enableMath
    ? {
        // @ts-expect-error - remarkMath types are not properly exposed
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
      }
    : {};

  const detailsComponents: Components = enableDetails
    ? {
        details({ children, ...props }) {
          return (
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
          );
        },
        summary({ children, ...props }) {
          return (
            <summary
              className={cn(
                "flex items-center gap-3 cursor-pointer py-4 px-4",
                "transition-all duration-200 ease-out",
                "hover:bg-accent/50 active:bg-accent/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
          );
        },
      }
    : {};

  const components: Components = {
    ...baseComponents,
    ...mathComponents,
    ...detailsComponents,
  };

  const processedContent = enableDetails
    ? content.replace(
        /<details>([\s\S]*?)<\/details>/g,
        (match) => `\n${match}\n`
      )
    : content;

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
};
