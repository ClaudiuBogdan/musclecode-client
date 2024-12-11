import React, { useState } from "react";
import { usePythonRuntime } from "../hooks/usePythonRuntime";
import { PythonRuntimeStatus } from "../types/python-runtime.types";

interface PythonExecutorProps {
  initialCode?: string;
  onResult?: (result: any) => void;
}

export const PythonExecutor: React.FC<PythonExecutorProps> = ({
  initialCode = "",
  onResult,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");

  const { status, error, executeCode, isReady } = usePythonRuntime({
    onStdout: (text) => {
      setOutput((prev) => prev + text);
    },
    onStderr: (text) => {
      setOutput((prev) => prev + "\nError: " + text);
    },
  });

  const handleExecute = async () => {
    try {
      setOutput("");
      const result = await executeCode(code);

      if (result.success) {
        setOutput(
          (prev) =>
            `${prev}\n${result.stdout || ""}\nResult: ${result.result || "None"}`
        );
        onResult?.(result.result);
      } else {
        setOutput(
          (prev) =>
            `${prev}\n${result.stdout || ""}\nError: ${result.error || "Unknown error"}`
        );
      }
    } catch (err) {
      setOutput(`Error: ${err}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            status === PythonRuntimeStatus.READY
              ? "bg-green-500"
              : status === PythonRuntimeStatus.ERROR
                ? "bg-red-500"
                : "bg-yellow-500"
          }`}
        />
        <span className="text-sm">Status: {status}</span>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-48 p-2 font-mono text-sm border rounded"
        placeholder="Enter Python code here..."
      />

      <button
        onClick={handleExecute}
        disabled={!isReady}
        className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-400"
      >
        Execute
      </button>

      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-100 rounded">
          {error}
        </div>
      )}

      {output && (
        <pre className="p-2 overflow-auto text-sm bg-gray-100 rounded">
          {output}
        </pre>
      )}
    </div>
  );
};
