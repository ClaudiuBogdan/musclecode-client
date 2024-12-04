import { http, HttpResponse } from "msw";
import { seedAlgorithms } from "./seed";
import { Algorithm } from "@/types/algorithm";
import { checkIfCompleted, getNextAlgorithm } from "./fn";

export const byId = http.get("/api/algorithms/:id", ({ params }) => {
  const { id } = params;
  const algorithms = seedAlgorithms();
  const algorithm = algorithms.find((algo) => algo.id === id) as Algorithm;
  if (!algorithm) {
    return new HttpResponse(null, { status: 404 });
  }
  algorithm.completed = checkIfCompleted(id as string);
  const nextAlgorithm = getNextAlgorithm(id as string);
  return HttpResponse.json({ algorithm, nextAlgorithm });
});
