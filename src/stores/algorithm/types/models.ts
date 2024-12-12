import { Algorithm, AlgorithmId } from "@/types/algorithm";

export interface NextAlgorithm {
  id: AlgorithmId;
  title: string;
}

export interface AlgorithmResponse {
  algorithm: Algorithm;
  nextAlgorithm: NextAlgorithm | null;
}
