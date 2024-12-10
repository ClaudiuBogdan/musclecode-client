import { Algorithm } from "@/types/algorithm";
import { useMockAlgorithmsStore } from "../../store/algorithms";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { v4 as uuidv4 } from "uuid";


export function getDailyAlgorithms() {
  const store = useMockAlgorithmsStore.getState();
  return store.getAllAlgorithms();
}

export function getAlgorithm(algorithmId: string) {
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.getAlgorithm(algorithmId);

  if (!algorithm) {
    throw new Error(`Algorithm with id ${algorithmId} not found`);
  }

  // Get next algorithm
  const allAlgorithms = store.getAllAlgorithms();
  const currentIndex = allAlgorithms.findIndex((a) => a.id === algorithmId);
  const nextAlgorithm =
    currentIndex < allAlgorithms.length - 1
      ? {
          id: allAlgorithms[currentIndex + 1].id,
          title: allAlgorithms[currentIndex + 1].title,
        }
      : null;

  return {
    algorithm,
    nextAlgorithm,
  };
}

export async function createAlgorithm(
  payload: CreateAlgorithmPayload
): Promise<Algorithm> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Ensure store is initialized
  const store = useMockAlgorithmsStore.getState();

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

  try {
    // Save to store
    store.addAlgorithm(algorithm);

    // Verify the algorithm was saved
    const savedAlgorithm = store.getAlgorithm(algorithm.id);
    if (!savedAlgorithm) {
      throw new Error("Failed to save algorithm to store");
    }

    return algorithm;
  } catch (error) {
    console.error("Error creating algorithm:", error);
    throw new Error("Failed to create algorithm");
  }
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

export function checkIfCompleted(algorithmId: string): boolean {
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.getAlgorithm(algorithmId);
  return algorithm?.completed ?? false;
}

export function getNextAlgorithm(currentAlgorithmId: string) {
  const store = useMockAlgorithmsStore.getState();
  const allAlgorithms = store.getAllAlgorithms();
  const currentIndex = allAlgorithms.findIndex(
    (a) => a.id === currentAlgorithmId
  );

  if (currentIndex === -1 || currentIndex === allAlgorithms.length - 1) {
    return null;
  }

  const nextAlgorithm = allAlgorithms[currentIndex + 1];
  return {
    id: nextAlgorithm.id,
    title: nextAlgorithm.title,
  };
}
