import { http, HttpResponse } from "msw";
import { seedAlgorithms } from "./seed";
import { Algorithm } from "@/types/algorithm";

export const byId = http.get("/api/algorithms/:id", ({ params }) => {
  const { id } = params;
  const algorithms = seedAlgorithms();
  const algorithm = algorithms.find((algo) => algo.id === id) as Algorithm;
  if (!algorithm) {
    return new HttpResponse(null, { status: 404 });
  }
  return HttpResponse.json(algorithm);
});
