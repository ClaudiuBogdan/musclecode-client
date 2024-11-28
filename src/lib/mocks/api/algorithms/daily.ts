import { http, HttpResponse } from "msw";
import { seedAlgorithms } from "./seed";

export const daily = http.get("/api/algorithms/daily", () => {
  return HttpResponse.json(seedAlgorithms().slice(0, 6));
});
