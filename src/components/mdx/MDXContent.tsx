import {
  type ComponentType,
  type ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { MDXProvider } from "./MDXProvider";
import { compileMDX } from "@/lib/mdx";
import { ErrorBoundary } from "react-error-boundary";

interface MDXContentProps {
  code: string | ComponentType;
  fallback?: ReactNode;
  className?: string;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="text-destructive p-4">
      <p className="font-bold mb-2">Error rendering markdown:</p>
      <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-2 rounded">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

export function MDXContent({ code, fallback, className }: MDXContentProps) {
  const [Content, setContent] = useState<ComponentType | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        if (typeof code === "string") {
          const component = await compileMDX(code);
          setContent(() => component);
        } else {
          setContent(() => code);
        }
      } catch (err) {
        console.error("Failed to compile MDX:", err);
        throw err;
      }
    };

    loadContent();
  }, [code]);

  if (!Content) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          Loading content...
        </div>
      )
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          fallback ?? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              Loading content...
            </div>
          )
        }
      >
        <MDXProvider className={className}>
          <Content />
        </MDXProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
