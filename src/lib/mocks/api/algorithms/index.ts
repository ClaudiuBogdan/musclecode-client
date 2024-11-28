import { http, HttpResponse } from "msw";
import { seedAlgorithms } from "./seed";

export const all = http.get("/api/algorithms", () => {
  return HttpResponse.json(seedAlgorithms());
});
