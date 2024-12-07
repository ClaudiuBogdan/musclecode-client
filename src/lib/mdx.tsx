import * as runtime from "react/jsx-runtime";
import { compile, run } from "@mdx-js/mdx";
import type { CompileOptions } from "@mdx-js/mdx";
import type { ComponentType } from "react";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

const defaultOptions: CompileOptions = {
  jsxImportSource: "react",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeHighlight, rehypeSlug],
  format: "mdx",
  outputFormat: "function-body",
  baseUrl: import.meta.url,
};

/**
 * Compiles MDX content into a React component
 * @param source - The MDX/Markdown content to compile
 * @param options - Optional MDX compilation options
 * @returns A Promise that resolves to a React component
 */
export async function compileMDX(
  source: string,
  options: CompileOptions = defaultOptions
): Promise<ComponentType> {
  if (!source) {
    return () => null;
  }

  try {
    // Clean up the source by removing any potential import statements
    const cleanSource = source.replace(/^import\s+.*?[\r\n]+/gm, "");

    // Compile MDX to JavaScript
    const code = String(
      await compile(cleanSource, {
        ...defaultOptions,
        ...options,
      })
    );

    // Evaluate the compiled code and get the component
    const exports = await run(code, runtime);

    // Ensure we have a valid component
    if (typeof exports.default !== "function") {
      throw new Error(
        "MDX compilation did not result in a valid React component"
      );
    }

    return exports.default;
  } catch (error) {
    console.error("Error compiling MDX:", error);

    // Return a fallback component that displays the error and source
    const FallbackComponent = () => (
      <div className="text-destructive p-4">
        <p className="font-bold mb-2">Error compiling markdown:</p>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-2 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <details className="mt-4">
          <summary className="cursor-pointer">Show source</summary>
          <pre className="whitespace-pre-wrap font-mono text-sm mt-2 bg-muted p-2 rounded">
            {source}
          </pre>
        </details>
      </div>
    );

    return FallbackComponent;
  }
}
