import { CodeLanguage, Difficulty } from "@/types/algorithm";
import { FileName, AlgorithmId } from "./state";

export interface CodeActions {
  setCode: (algorithmId: AlgorithmId, code: string) => void;
  setActiveLanguage: (algorithmId: AlgorithmId, language: CodeLanguage) => void;
  setActiveTab: (algorithmId: AlgorithmId, tab: FileName) => void;
  resetCode: (algorithmId: AlgorithmId) => void;
  getCode: (
    algorithmId: AlgorithmId,
    language: CodeLanguage,
    tab: FileName
  ) => string;
  getFiles: (
    algorithmId: AlgorithmId,
    language: CodeLanguage
  ) => Array<{ name: string; readOnly?: boolean }>;
}

export interface TimerActions {
  startTimer: (algorithmId: AlgorithmId) => void;
  pauseTimer: (algorithmId: AlgorithmId) => void;
  resumeTimer: (algorithmId: AlgorithmId) => void;
  resetTimer: (algorithmId: AlgorithmId) => void;
  getTotalRunningTime: (algorithmId: AlgorithmId) => number;
}

export interface ExecutionActions {
  runCode: (algorithmId: AlgorithmId) => Promise<void>;
}

export interface SubmissionActions {
  submit: (
    algorithmId: AlgorithmId,
    difficulty: Difficulty
  ) => Promise<boolean>;
  setGlobalNotes: (algorithmId: AlgorithmId, notes: string) => void;
  setSubmissionNotes: (algorithmId: AlgorithmId, notes: string) => void;
}

export interface AlgorithmActions {
  initializeAlgorithm: (algorithmId: AlgorithmId) => Promise<void>;
}

export type StoreActions = CodeActions &
  TimerActions &
  ExecutionActions &
  SubmissionActions &
  AlgorithmActions;
