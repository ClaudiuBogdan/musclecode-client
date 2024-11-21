export interface AlgorithmFile {
  name: string;
  content: string;
  isMain: boolean;
  language: string;
  readOnly?: boolean;
}

export interface Algorithm {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  files: Record<string, AlgorithmFile[]>; // keyed by language
}

export type AlgorithmPreview = Omit<Algorithm, "files">;
