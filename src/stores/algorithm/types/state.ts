import { CodeLanguage } from "@/types/algorithm";
import { CodeExecutionResponse } from "@/types/testRunner";

export type AlgorithmId = string;
export type CodeFile = string;

export type StoredCode = Record<CodeLanguage, Record<CodeFile, string>>;

export interface CodeState {
  activeLanguage: CodeLanguage;
  activeTab: CodeFile;
  storedCode: StoredCode;
  initialStoredCode: StoredCode;
}

export interface TimerState {
  initialStartTime: number;
  pausedAt: number | null;
  totalPausedTime: number;
}

export interface ExecutionState {
  isExecuting: boolean;
  executionResult: CodeExecutionResponse | null;
  error: Error | null;
}

export interface SubmissionState {
  isSubmitting: boolean;
  completed: boolean;
  submissionNotes: string;
  globalNotes: string;
}

export interface AlgorithmMetadataState {
  algorithmId: string;
  description: string;
  nextAlgorithm: {
    id: string;
    title: string;
  } | null;
}

export interface AlgorithmData {
  code: CodeState;
  timer: TimerState;
  execution: ExecutionState;
  submission: SubmissionState;
  metadata: AlgorithmMetadataState;
}

export interface AlgorithmState {
  metadata: {
    isLoading: boolean;
    activeAlgorithmId: string | null;
    error: string | null;
  };
  algorithms: Record<AlgorithmId, AlgorithmData>;
}
