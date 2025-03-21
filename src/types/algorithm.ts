export type AlgorithmFileType = "exercise" | "solution" | "test";

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
  hidden?: boolean;
}

export interface AlgorithmTemplate {
  id: string;
  title: string;
  categories: string[];
  summary: string;
  lessons: AlgorithmLesson[];
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  files: AlgorithmFile[];
}

export interface AlgorithmLesson {
  id: string;
  title: string;
  content: string; // Markdown
};

export interface AlgorithmUserData {
  id: string;
  userId: string;
  algorithmId: string;
  notes: string;
}

export interface DailyAlgorithm {
  id: string;
  date: string;
  completed: boolean;
  createdAt: string;
  algorithmPreview: AlgorithmPreview;
}

export interface AlgorithmUserProgress {
  completed: boolean;
  isSubmitting: boolean;
  submissionNote: string;
  notes: {
    content: string;
    state: "saving" | "saved" | "error";
  };
  dailyProgress?: {
    date: string;
    completed: boolean;
  };
  lastSubmissionDate?: string;
}

export type AlgorithmPreview = Pick<
  AlgorithmTemplate,
  "id" | "title" | "categories" | "difficulty" | "tags"
>;

export interface RatingSchedule {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface Submission {
  id: string;
  algorithmId: string;
  timeSpent: number;
  files: AlgorithmFile[];
  language: string;
  notes: string;
  rating: Rating;
  createdAt: string;
}
