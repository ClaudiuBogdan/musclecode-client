import { http, HttpResponse } from "msw";
import { useMockAlgorithmsStore } from "../../store/algorithms";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "MockAlgorithmsApi" });

export const getAlgorithms = http.get("/api/algorithms", async () => {
  try {
    const response = await apiClient.get("/api/v1/algorithms");
    return HttpResponse.json(response.data);
  } catch (error) {
    logger.error("Mock Get Algorithms Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return HttpResponse.json(
      { error: "Failed to get algorithms" },
      { status: 500 }
    );
  }
});

export const all = http.get("/api/algorithms", () => {
  const store = useMockAlgorithmsStore.getState();
  const algorithms = store.algorithms;
  return HttpResponse.json(algorithms);
});
