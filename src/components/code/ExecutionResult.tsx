import { cn } from "@/lib/utils";
import { CodeExecutionResponse, TestItem } from "@/types/testRunner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { MatrixRain } from "./MatrixAnimation";

interface ExecutionResultProps {
  result: CodeExecutionResponse | null;
  isExecuting?: boolean;
}

interface TestItemComponentProps {
  item: TestItem;
  level?: number;
}

const TestItemComponent = ({ item, level = 0 }: TestItemComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = () => {
    if (item.t === "completedin")
      return <Clock className="h-4 w-4 text-gray-400" />;
    if (item.t === "passed")
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (item.t === "error")
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (item.p) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getItemClass = () => {
    if (item.t === "describe") return "font-semibold text-gray-200";
    if (item.t === "it") return "text-gray-300";
    if (item.t === "failed") return "text-red-400 text-sm";
    if (item.t === "passed") return "text-green-400 text-sm";
    if (item.t === "error")
      return "text-yellow-400 text-sm font-mono whitespace-pre-wrap";
    if (item.t === "completedin") return "text-gray-400 text-sm";
    return "";
  };

  if (item.t === "completedin" && !item.items) {
    return null;
  }

  const hasError =
    item.error || item.items?.some((subItem) => subItem.t === "error");
  const hasItems = item.items && item.items.length > 0;

  const baseIndent = level * 24;

  const indentStyle = {
    marginLeft:
      item.t === "describe" ? `${baseIndent}px` : `${baseIndent + 24}px`,
  };

  return (
    <div>
      <div
        style={indentStyle}
        className={cn(
          "flex items-start gap-2",
          item.t === "describe" &&
            "cursor-pointer hover:bg-gray-800/50 rounded px-2 py-1"
        )}
        onClick={() => {
          if (item.t === "describe") {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {item.t === "describe" && (
          <ChevronRight
            className={cn(
              "h-4 w-4 text-gray-400 mt-1 transition-transform shrink-0",
              isExpanded && "transform rotate-90"
            )}
          />
        )}
        <div className="mt-1 shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <div className={getItemClass()}>{item.v}</div>
          {item.error && (
            <div className="mt-2 mb-2">
              <div className="bg-yellow-950/30 p-2 rounded text-yellow-400 font-mono text-sm whitespace-pre-wrap">
                {item.error}
              </div>
            </div>
          )}
          {hasError &&
            (item.t === "failed" || item.t === "it") &&
            !item.error && (
              <div className="mt-2 mb-2">
                {item.items?.map(
                  (subItem, index) =>
                    subItem.t === "error" && (
                      <div
                        key={index}
                        className="bg-yellow-950/30 p-2 rounded text-yellow-400 font-mono text-sm whitespace-pre-wrap"
                      >
                        {subItem.v}
                      </div>
                    )
                )}
              </div>
            )}
        </div>
        {/* TODO: fix this */}
        {/* {(item.t === "it" || item.t === "failed" || item.t === "passed") && (
          <span className="text-xs text-gray-500 mt-1 shrink-0">
            {item.items?.find((i) => i.t === "completedin")?.v}ms
          </span>
        )} */}
      </div>
      {isExpanded && hasItems && (
        <div className="space-y-1">
          {item.items?.map(
            (subItem, index) =>
              !["error", "completedin"].includes(subItem.t) && (
                <TestItemComponent
                  key={index}
                  item={subItem}
                  level={level + 1}
                />
              )
          )}
        </div>
      )}
    </div>
  );
};

const ExecutionSummary = ({ result }: { result: CodeExecutionResponse }) => {
  const { passed, failed, errors } = result.result;
  const total = passed + failed + errors;
  const hasCompilationError =
    result.stderr && result.result.output.length === 0;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
      {!hasCompilationError && (
        <>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-300">
              Passed: <span className="text-green-500">{passed}</span>/{total}
            </span>
          </div>
          {failed > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-300">
                Failed: <span className="text-red-500">{failed}</span>
              </span>
            </div>
          )}
          {errors > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-300">
                Errors: <span className="text-yellow-500">{errors}</span>
              </span>
            </div>
          )}
        </>
      )}
      {hasCompilationError && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-gray-300">Compilation Error</span>
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">
          {result.wallTime.toFixed(2)}ms
        </span>
      </div>
    </div>
  );
};

const CompilationError = ({ result }: { result: CodeExecutionResponse }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-gray-300">{result.message}</span>
        </div>
      </div>
      <div className="p-4 overflow-auto">
        <div className="bg-red-950/30 p-3 rounded border border-red-900/50">
          <div className="text-red-400 mb-2 font-semibold">
            Compilation Error
          </div>
          <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap overflow-auto">
            {result.stderr ||
              result.result.error ||
              "Unknown compilation error"}
          </pre>
        </div>
      </div>
    </div>
  );
};

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <MatrixRain />
    </div>
  );
};

const ConsoleOutput = ({ stdout }: { stdout: string }) => {
  if (!stdout) return null;

  return (
    <div className="border-t border-gray-700 mt-4 pt-4">
      <div className="text-gray-400 text-sm mb-2 font-semibold">
        Console Output
      </div>
      <pre className="bg-gray-900/50 p-3 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[200px]">
        {stdout}
      </pre>
    </div>
  );
};

export function ExecutionResult({
  result,
  isExecuting = false,
}: ExecutionResultProps) {
  if (isExecuting) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Run your code to see the results
      </div>
    );
  }

  // Check for compilation error first
  const hasCompilationError =
    result.type === "execution error" &&
    (result.message === "Compilation failed" ||
      result.message === "Syntax error");

  if (hasCompilationError) {
    return <CompilationError result={result} />;
  }

  // Check for runtime execution error without test results
  if (result.type === "execution error" && !result.result.output.length) {
    return (
      <div className="h-full flex flex-col">
        <ExecutionSummary result={result} />
        <div className="flex-1 relative overflow-auto text-red-400 font-mono text-sm whitespace-pre-wrap  bg-yellow-950/30 rounded">
          <div className="absolute p-8">
            {result.stderr ||
              result.message ||
              "An error occurred during execution"}
          </div>
        </div>
      </div>
    );
  }

  // Regular test results display
  return (
    <div className="h-full flex flex-col">
      <ExecutionSummary result={result} />
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {result.result.output.map((item, index) => (
            <TestItemComponent key={index} item={item} />
          ))}
        </div>
        {result.stdout && <ConsoleOutput stdout={result.stdout} />}
      </div>
    </div>
  );
}
