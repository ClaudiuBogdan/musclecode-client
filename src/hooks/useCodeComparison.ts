import { useAlgorithmStore } from "@/stores/algorithm";

export function useCodeComparison(algorithmId: string) {
  const algorithm = useAlgorithmStore((state) => state.algorithms[algorithmId]);

  if (!algorithm) {
    return false;
  }

  const { storedCode, initialStoredCode, activeLanguage, activeTab } =
    algorithm.code;

  // Check if current code is different from initial code
  const currentCode = storedCode[activeLanguage]?.[activeTab]?.content;
  const initialCode = initialStoredCode[activeLanguage]?.[activeTab]?.content;

  return currentCode !== initialCode;
}
