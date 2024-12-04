import { http, HttpResponse } from "msw";
import { getDailyAlgorithms } from "./fn";

export const daily = http.get("/api/algorithms/daily", async () => {
  const algorithms = getDailyAlgorithms();
  return HttpResponse.json(algorithms);
});

