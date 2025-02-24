import { AlgorithmFile, CodeLanguage, Rating } from "@/types/algorithm";
import { FileId, AlgorithmId } from "./state";

export interface CodeActions {
  setCode: (
    algorithmId: AlgorithmId,
    language: CodeLanguage,
    fileId: string,
    code: string
  ) => void;
  setActiveLanguage: (algorithmId: AlgorithmId, language: CodeLanguage) => void;
  setActiveTab: (algorithmId: AlgorithmId, tab: FileId) => void;
  resetCode: (algorithmId: AlgorithmId) => void;
  getActiveFile: (
    algorithmId: AlgorithmId,
    language: CodeLanguage,
    fileId: FileId
  ) => AlgorithmFile;
  getFiles: (
    algorithmId: AlgorithmId,
    language: CodeLanguage
  ) => Array<AlgorithmFile>;
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
  submit: (algorithmId: AlgorithmId, difficulty: Rating) => Promise<boolean>;
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
