import { http, HttpResponse } from "msw";
import { seedAlgorithms } from "./seed";

export const daily = http.get("/api/algorithms/daily", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return HttpResponse.json(seedAlgorithms().slice(0, 6));
});
