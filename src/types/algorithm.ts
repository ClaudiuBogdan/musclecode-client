export type AlgorithmFileType = "solution" | "test";

export type AlgorithmId = string;

export interface AlgorithmFile {
  id: string;
  name: string;
  type: AlgorithmFileType;
  content: string;
  language: CodeLanguage;
  readOnly?: boolean;
  required?: boolean;
}

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "java"
  | "cpp";

export type Difficulty = "again" | "hard" | "good" | "easy";

export interface Algorithm {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  notes: string;
  files: AlgorithmFile[];
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
