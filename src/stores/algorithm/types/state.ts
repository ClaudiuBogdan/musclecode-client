import {
  AlgorithmFile,
  CodeLanguage,
  AlgorithmTemplate,
  Submission,
} from "@/types/algorithm";
import { CodeExecutionResponse } from "@/types/testRunner";

export type AlgorithmId = string;
export type FileName = string;

export type StoredCode = Record<CodeLanguage, Record<FileName, AlgorithmFile>>;

export interface CodeState {
  activeLanguage: CodeLanguage;
  activeTab: FileName;
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

export interface UserProgressState {
  isSubmitting: boolean;
  completed: boolean;
  notes: {
    content: string;
    state: "saved" | "saving" | "error";
  };
  submissionNote: string;
  lastSubmissionDate: string | null;
  submissions: Submission[];
}

export interface AlgorithmMetadataState {
  algorithmId: string;
  template: AlgorithmTemplate | null;
  nextAlgorithm: {
    id: string;
    title: string;
  } | null;
}

export interface AlgorithmData {
  code: CodeState;
  timer: TimerState;
  execution: ExecutionState;
  userProgress: UserProgressState;
  metadata: AlgorithmMetadataState;
  _createdAt: number;
}

export interface AlgorithmState {
  metadata: {
    isLoading: boolean;
    activeAlgorithmId: string | null;
    error: string | null;
  };
  algorithms: Record<AlgorithmId, AlgorithmData>;
}
