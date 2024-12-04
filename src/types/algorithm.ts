export interface AlgorithmFile {
  name: string;
  content: string;
  isMain: boolean;
  language: string;
  readOnly?: boolean;
}

export type Difficulty = "again" | "hard" | "good" | "easy";

export interface Algorithm {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  notes: string;
  files: Record<string, AlgorithmFile[]>; // keyed by language
  // Daily challenge
  completed: boolean;
}

export type AlgorithmPreview = Omit<Algorithm, "files">;

export interface Submission {
  id: string;
  algorithmId: string;
  timeSpent: number;
  code: string;
  language: string;
  notes: string;
  difficulty: Difficulty;
  createdAt: string;
}
