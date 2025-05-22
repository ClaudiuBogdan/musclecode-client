import type { AlgorithmFile, AlgorithmLesson } from "./algorithm";

export interface NewAlgorithmMetadata {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  categories: string[];
  summary: string;
}

export interface NewAlgorithm {
  metadata: NewAlgorithmMetadata;
  lessons: AlgorithmLesson[];
  files: AlgorithmFile[];
}

export interface ValidationError {
  tab: "metadata" | "description" | "solutions";
  field: string;
  message: string;
}

export interface CreateAlgorithmPayload {
  title: string;
  categories: string[];
  summary: string;
  tags: string[];
  lessons: AlgorithmLesson[];
  difficulty: "easy" | "medium" | "hard";
  files: AlgorithmFile[];
}
