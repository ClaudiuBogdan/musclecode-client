import { useEffect, useRef, useState } from "react";
import { PythonRuntime } from "../services/python-runtime.service";
import type {
  ExecutionResult,
  PythonRuntimeStatus,
} from "../types/python-runtime.types";

export interface UsePythonRuntimeOptions {
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  onStatusChange?: (status: PythonRuntimeStatus) => void;
}

export function usePythonRuntime(options: UsePythonRuntimeOptions = {}) {
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const [status, setStatus] = useState<PythonRuntimeStatus>(
    PythonRuntimeStatus.INITIALIZING
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runtime = new PythonRuntime({
      stdout: options.onStdout,
      stderr: options.onStderr,
      onStatus: (newStatus) => {
        setStatus(newStatus);
        options.onStatusChange?.(newStatus);
      },
    });

    runtimeRef.current = runtime;

    runtime.initialize().catch((err) => {
      setError(err.message);
    });

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, []);

  const executeCode = async (code: string): Promise<ExecutionResult> => {
    if (!runtimeRef.current) {
      throw new Error("Python runtime not initialized");
    }

    try {
      setError(null);
      return await runtimeRef.current.execute(code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  };

  const installPackage = async (packageName: string): Promise<void> => {
    if (!runtimeRef.current) {
      throw new Error("Python runtime not initialized");
    }

    try {
      setError(null);
      await runtimeRef.current.installPackage(packageName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    error,
    executeCode,
    installPackage,
    isReady: status === PythonRuntimeStatus.READY,
  };
}
