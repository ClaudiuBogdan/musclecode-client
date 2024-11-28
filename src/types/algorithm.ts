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
  nextAlgorithm: {
    id: string;
    title: string;
  } | null;
  files: Record<string, AlgorithmFile[]>; // keyed by language
}

export type AlgorithmPreview = Omit<Algorithm, "files">;
