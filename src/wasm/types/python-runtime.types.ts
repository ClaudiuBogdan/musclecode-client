/**
 * @fileoverview Core types for the Python WASM runtime implementation.
 *
 * TODO: Future Improvements
 * - Add support for structured Python objects in results (not just string conversion)
 * - Add timeout configuration for long-running code
 * - Add memory usage limits and monitoring
 * - Add support for module imports and package management
 * - Add support for file system operations
 * - Add support for WebWorker execution
 * - Add proper error type hierarchy
 */

import type { PyodideInterface } from "pyodide";

/**
 * Configuration options for the Python runtime
 */
export interface PythonRuntimeConfig {
  /** Callback for standard output */
  stdout?: (text: string) => void;
  /** Callback for standard error */
  stderr?: (text: string) => void;
  /** Callback for runtime status changes */
  onStatus?: (status: PythonRuntimeStatus) => void;
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Maximum memory usage in bytes */
  memoryLimit?: number;
  /** Whether to run in a WebWorker (not implemented yet) */
  useWorker?: boolean;
}

/**
 * Represents a Python execution result
 * TODO: Add support for structured Python objects instead of string conversion
 */
export interface ExecutionResult {
  success: boolean;
  /** The execution result. Currently a string, but should be typed based on Python type */
  result?: string | number | boolean | null;
  /** Error message if execution failed */
  error?: string;
  /** Standard output content */
  stdout?: string;
  /** Standard error content */
  stderr?: string;
  /** Execution metrics */
  metrics?: ExecutionMetrics;
}

/**
 * Execution performance metrics
 * TODO: Implement metric collection
 */
export interface ExecutionMetrics {
  /** Execution time in milliseconds */
  executionTime: number;
  /** Peak memory usage in bytes */
  peakMemoryUsage: number;
  /** Number of Python operations executed */
  operationCount: number;
}

/**
 * Runtime status enumeration
 */
export enum PythonRuntimeStatus {
  INITIALIZING = "initializing",
  READY = "ready",
  EXECUTING = "executing",
  ERROR = "error",
  TERMINATED = "terminated",
}

/**
 * Custom error types for Python runtime
 * TODO: Implement proper error hierarchy
 */
export class PythonRuntimeError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "PythonRuntimeError";
  }
}

/**
 * Core runtime interface
 * TODO: Add methods for:
 * - Module management
 * - Resource cleanup
 * - State persistence
 * - Worker communication
 */
export interface IPythonRuntime {
  /** Initialize the Python runtime */
  initialize(): Promise<void>;

  /** Execute Python code and return the result */
  execute(code: string): Promise<ExecutionResult>;

  /** Install a Python package */
  installPackage(packageName: string): Promise<void>;

  /** Get the current runtime status */
  getStatus(): PythonRuntimeStatus;

  /** Clean up resources and terminate the runtime */
  destroy(): void;
}
