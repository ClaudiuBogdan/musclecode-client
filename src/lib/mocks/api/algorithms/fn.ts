import { mockedSubmissionsStore } from "../../store/submissions";
import { seedAlgorithms } from "./seed";

export function getDailyAlgorithms() {
  const algorithms = seedAlgorithms().slice(0, 6);
  const submissions = mockedSubmissionsStore.getState().getSubmissions();
  for (const algorithm of algorithms) {
    algorithm.completed = submissions.some(
      (s) => s.algorithmId === algorithm.id
    );
  }
  return algorithms;
}

export function getNextAlgorithm(algorithmId: string) {
  const algorithms = getDailyAlgorithms()
    .filter((a) => !a.completed)
    .filter((a) => a.id !== algorithmId);

  const nextAlgorithm = algorithms[0];

  if (!nextAlgorithm) {
    return null;
  }

  return {
    id: nextAlgorithm.id,
    title: nextAlgorithm.title,
  };
}

export function checkIfCompleted(algorithmId: string) {
  const submissions = mockedSubmissionsStore.getState().getSubmissions();
  return submissions.some((s) => s.algorithmId === algorithmId);
}
