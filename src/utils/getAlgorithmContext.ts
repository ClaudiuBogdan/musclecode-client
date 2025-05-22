import { useAlgorithmStore } from "@/stores/algorithm";

import type { AlgorithmFile } from "@/types/algorithm";
import type { ContextFile, MessageContext } from "@/types/chat";

export function getAlgorithmContext(algorithmId: string): MessageContext {
  const algorithmData = useAlgorithmStore.getState().algorithms[algorithmId];

  if (!algorithmData) {
    throw new Error(`Algorithm with id ${algorithmId} not found`);
  }

  // Destructure necessary parts from the algorithm data
  const { code, execution } = algorithmData;
  const { storedCode, activeLanguage } = code;
  const languageFiles = (storedCode[activeLanguage] || {});

  // Find the exercise file and test file
  const exerciseFile = Object.values(languageFiles).find(
    (file: AlgorithmFile) => file.type === "exercise"
  );

  if (!exerciseFile) {
    throw new Error("Exercise file not found");
  }

  const testFile = Object.values(languageFiles).find(
    (file: AlgorithmFile) => file.type === "test"
  );

  // Build the context files array
  const files: ContextFile[] = [];

  files.push({
    name: exerciseFile.name,
    content: exerciseFile.content,
    description: "## This is the exercise file",
  });

  if (testFile) {
    files.push({
      name: testFile.name,
      content: testFile.content,
      description: "## This is the test file",
    });
  }

  if (execution && execution.executionResult) {
    files.push({
      name: "execution-result.txt",
      content: JSON.stringify(execution.executionResult, null, 2),
      description: "## This is the execution result",
    });
  }

  return {
    files,
  };
}
