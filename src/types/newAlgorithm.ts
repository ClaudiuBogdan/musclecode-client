import { AlgorithmFile } from "./algorithm";

export interface NewAlgorithmMetadata {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  categories: string[];
  summary: string;
}

export interface NewAlgorithm {
  metadata: NewAlgorithmMetadata;
  description: string;
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
  description: string;
  difficulty: "easy" | "medium" | "hard";
  files: AlgorithmFile[];
}
