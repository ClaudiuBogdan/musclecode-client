import { http, HttpResponse } from "msw";
import { useMockAlgorithmsStore } from "../../store/algorithms";

export const all = http.get("/api/algorithms", () => {
  const store = useMockAlgorithmsStore.getState();
  const algorithms = store.getAllAlgorithms();
  return HttpResponse.json(algorithms);
});
