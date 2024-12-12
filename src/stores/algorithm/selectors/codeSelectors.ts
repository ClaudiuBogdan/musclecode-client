import { AlgorithmState, CodeFile } from "../types";
import { CodeLanguage } from "@/types/algorithm";

export const selectActiveCode = (
  state: AlgorithmState,
  algorithmId: string
): string => {
  const algorithm = state.algorithms[algorithmId];
  if (!algorithm) return "";

  const { activeLanguage, activeTab, storedCode } = algorithm.code;
  return storedCode[activeLanguage]?.[activeTab] ?? "";
};

export const selectActiveLanguage = (
  state: AlgorithmState,
  algorithmId: string
): CodeLanguage | null => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.code.activeLanguage ?? null;
};

export const selectActiveTab = (
  state: AlgorithmState,
  algorithmId: string
): CodeFile | null => {
  const algorithm = state.algorithms[algorithmId];
  return algorithm?.code.activeTab ?? null;
};

export const selectAvailableLanguages = (
  state: AlgorithmState,
  algorithmId: string
): CodeLanguage[] => {
  const algorithm = state.algorithms[algorithmId];
  if (!algorithm) return [];

  return Object.keys(algorithm.code.storedCode) as CodeLanguage[];
};

export const selectAvailableFiles = (
  state: AlgorithmState,
  algorithmId: string,
  language: CodeLanguage
): Array<{ name: string; readOnly?: boolean }> => {
  const algorithm = state.algorithms[algorithmId];
  if (!algorithm) return [];

  const files = algorithm.code.storedCode[language] ?? {};
  return Object.keys(files).map((name) => ({ name, readOnly: false }));
};
