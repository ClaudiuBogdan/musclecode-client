import { CodeLanguage } from "@/stores/algorithm";

export interface NewAlgorithmMetadata {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface NewAlgorithmDescription {
  content: string;
}

export interface NewAlgorithmLanguageFiles {
  id: string;
  language: CodeLanguage;
  solutionFile: {
    content: string;
  };
  testFile: {
    content: string;
  };
}

export interface NewAlgorithm {
  metadata: NewAlgorithmMetadata;
  description: NewAlgorithmDescription;
  languages: NewAlgorithmLanguageFiles[];
}

export interface CreateAlgorithmPayload {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  description: string;
  languages: {
    [key in CodeLanguage]?: {
      solution: string;
      test: string;
    };
  };
}
