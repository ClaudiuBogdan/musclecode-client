import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { Algorithm } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";

export async function createAlgorithm(
  payload: CreateAlgorithmPayload
): Promise<Algorithm> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert payload to Algorithm type
  const algorithm: Algorithm = {
    id: uuidv4(),
    title: payload.title,
    category: "custom",
    summary: "",
    description: payload.description,
    difficulty: payload.difficulty,
    notes: "",
    completed: false,
    files: Object.entries(payload.languages).reduce(
      (acc, [language, files]) => {
        if (!files) return acc;

        acc[language] = [
          {
            name: "solution." + getFileExtension(language),
            content: files.solution,
            isMain: true,
            language,
          },
          {
            name: "test." + getFileExtension(language),
            content: files.test,
            isMain: false,
            language,
            readOnly: true,
          },
        ];
        return acc;
      },
      {} as Algorithm["files"]
    ),
  };

  // In a real implementation, this would be saved to a database
  // For now, we'll just return the created algorithm
  return algorithm;
}

function getFileExtension(language: string): string {
  switch (language) {
    case "typescript":
      return "ts";
    case "javascript":
      return "js";
    case "python":
      return "py";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    default:
      return "txt";
  }
}
