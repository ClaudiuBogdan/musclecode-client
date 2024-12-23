export type AlgorithmFileType = "solution" | "test";

export type AlgorithmId = string;

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "java"
  | "cpp";

export type Rating = "again" | "hard" | "good" | "easy";

export type AlgorithmDifficulty = "easy" | "medium" | "hard";

export interface AlgorithmFile {
  id: string;
  name: string;
  type: AlgorithmFileType;
  content: string;
  language: CodeLanguage;
  extension: string;
  readOnly?: boolean;
  required?: boolean;
}

export interface AlgorithmTemplate {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  files: AlgorithmFile[];
}

export interface AlgorithmUserData {
  id: string;
  userId: string;
  algorithmId: string;
  notes: string;
}

export interface DailyAlgorithm {
  id: string;
  userId: string;
  algorithmId: string;
  date: string;
  completed: boolean;
}

export interface AlgorithmUserProgress {
  algorithmUserData: AlgorithmUserData | null;
  dailyAlgorithm: DailyAlgorithm | null;
  algorithmTemplate: AlgorithmTemplate;
}

export type BaseAlgorithmPreview = Pick<
  AlgorithmTemplate,
  "title" | "category" | "difficulty"
> & { algorithmId: string };

export type AlgorithmPreview = BaseAlgorithmPreview & {
  id: string;
  completed: boolean;
};

export interface Submission {
  id: string;
  algorithmId: string;
  timeSpent: number;
  code: string;
  language: string;
  notes: string;
  difficulty: Rating;
  createdAt: string;
}
