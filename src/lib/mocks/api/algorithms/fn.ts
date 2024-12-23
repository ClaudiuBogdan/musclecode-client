import { AlgorithmTemplate } from "@/types/algorithm";
import { useMockAlgorithmsStore } from "../../store/algorithms";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { v4 as uuidv4 } from "uuid";

export function getDailyAlgorithms() {
  const store = useMockAlgorithmsStore.getState();
  return store.algorithms;
}

export function getAlgorithm(algorithmId: string) {
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.algorithms.find((a) => a.id === algorithmId);

  if (!algorithm) {
    throw new Error(`Algorithm with id ${algorithmId} not found`);
  }

  // Get next algorithm
  const allAlgorithms = store.algorithms;
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
): Promise<AlgorithmTemplate> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Ensure store is initialized
  const store = useMockAlgorithmsStore.getState();

  // Convert payload to Algorithm type
  const algorithm: AlgorithmTemplate = {
    id: uuidv4(),
    title: payload.title,
    description: payload.description,
    category: payload.category,
    summary: payload.summary,
    tags: payload.tags,
    difficulty: payload.difficulty,
    files: payload.files,
  };

  try {
    // Save to store
    store.addAlgorithm(algorithm);

    // Verify the algorithm was saved
    const savedAlgorithm = store.algorithms.find((a) => a.id === algorithm.id);
    if (!savedAlgorithm) {
      throw new Error("Failed to save algorithm to store");
    }

    return algorithm;
  } catch (error) {
    console.error("Error creating algorithm:", error);
    throw new Error("Failed to create algorithm");
  }
}

export function checkIfCompleted(algorithmId: string): boolean {
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.algorithms.find((a) => a.id === algorithmId);
  return algorithm !== undefined; // This should read the completed state from the store. The template doesn't include the completed state.
}

export function getNextAlgorithm(currentAlgorithmId: string) {
  const store = useMockAlgorithmsStore.getState();
  const allAlgorithms = store.algorithms;
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
