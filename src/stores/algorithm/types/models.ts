import type {
  AlgorithmTemplate,
  AlgorithmId,
  AlgorithmUserProgress,
} from "@/types/algorithm";

export interface NextAlgorithm {
  id: AlgorithmId;
  title: string;
}

export interface AlgorithmResponse {
  template: AlgorithmTemplate;
  nextAlgorithm: NextAlgorithm | null;
}

export interface UserProgressResponse {
  progress: AlgorithmUserProgress;
  nextAlgorithm: NextAlgorithm | null;
}
