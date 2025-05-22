import { v4 as uuidv4 } from "uuid";

import { createLogger } from "@/lib/logger";


import { useMockAlgorithmsStore } from "../../store/algorithms";

import type { AlgorithmTemplate } from "@/types/algorithm";
import type { CreateAlgorithmPayload } from "@/types/newAlgorithm";

const logger = createLogger("MockAlgorithmAPI");

export function getDailyAlgorithms() {
  logger.debug("Fetching Daily Algorithms");
  const store = useMockAlgorithmsStore.getState();
  const algorithms = store.algorithms;
  logger.info("Daily Algorithms Fetched", { count: algorithms.length });
  return algorithms;
}

export function getAlgorithm(algorithmId: string) {
  logger.debug("Fetching Algorithm", { algorithmId });
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.algorithms.find((a) => a.id === algorithmId);

  if (!algorithm) {
    logger.error(
      "Algorithm Not Found",
      new Error(`Algorithm with id ${algorithmId} not found`)
    );
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

  logger.info("Algorithm Fetched", {
    algorithmId,
    hasNextAlgorithm: !!nextAlgorithm,
  });

  return {
    algorithm,
    nextAlgorithm,
  };
}

export async function createAlgorithm(
  payload: CreateAlgorithmPayload
): Promise<AlgorithmTemplate> {
  logger.debug("Creating Algorithm", {
    title: payload.title,
    categories: payload.categories,
    difficulty: payload.difficulty,
  });

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Ensure store is initialized
  const store = useMockAlgorithmsStore.getState();

  // Convert payload to Algorithm type
  const algorithm: AlgorithmTemplate = {
    id: uuidv4(),
    title: payload.title,
    lessons: payload.lessons,
    categories: payload.categories,
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
      const error = new Error("Failed to save algorithm to store");
      logger.error("Algorithm Creation Failed", error);
      throw error;
    }

    logger.info("Algorithm Created", {
      algorithmId: algorithm.id,
      title: algorithm.title,
      categories: algorithm.categories,
    });

    return algorithm;
  } catch (error) {
    logger.error("Algorithm Creation Failed", error as Error);
    throw new Error("Failed to create algorithm");
  }
}

export function checkIfCompleted(algorithmId: string): boolean {
  logger.debug("Checking Algorithm Completion", { algorithmId });
  const store = useMockAlgorithmsStore.getState();
  const algorithm = store.algorithms.find((a) => a.id === algorithmId);
  const isCompleted = algorithm !== undefined;
  logger.info("Algorithm Completion Status", { algorithmId, isCompleted });
  return isCompleted;
}

export function getNextAlgorithm(currentAlgorithmId: string) {
  logger.debug("Fetching Next Algorithm", { currentAlgorithmId });
  const store = useMockAlgorithmsStore.getState();
  const allAlgorithms = store.algorithms;
  const currentIndex = allAlgorithms.findIndex(
    (a) => a.id === currentAlgorithmId
  );

  if (currentIndex === -1 || currentIndex === allAlgorithms.length - 1) {
    logger.info("No Next Algorithm Found", { currentAlgorithmId });
    return null;
  }

  const nextAlgorithm = allAlgorithms[currentIndex + 1];
  logger.info("Next Algorithm Found", {
    currentAlgorithmId,
    nextAlgorithmId: nextAlgorithm.id,
  });

  return {
    id: nextAlgorithm.id,
    title: nextAlgorithm.title,
  };
}
