import type {
  AlgorithmFile,
  CodeLanguage,
  AlgorithmTemplate,
  Submission,
  RatingSchedule,
  AlgorithmPreview,
  DailyAlgorithm,
} from "@/types/algorithm";
import type { CodeExecutionResponse } from "@/types/testRunner";

export type AlgorithmId = string;
export type FileId = string;

export type StoredCode = Record<CodeLanguage, Record<FileId, AlgorithmFile>>;

export interface CodeState {
  activeLanguage: CodeLanguage;
  activeTab: FileId;
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

export interface HintState {
  isLoading: boolean;
  error: string | null;
  content: string | null;
  lastRequestTime: number | null;
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
  nextAlgorithm: AlgorithmPreview | null;
  ratingSchedule: RatingSchedule | null;
  dailyAlgorithm: DailyAlgorithm | null;
}

export interface AlgorithmData {
  code: CodeState;
  timer: TimerState;
  execution: ExecutionState;
  hint: HintState;
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
