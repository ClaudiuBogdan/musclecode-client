import { http, HttpResponse } from "msw";

import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "MockDailyAlgorithmsApi" });

export const daily = http.get("/api/algorithms/daily", async () => {
  try {
    const response = await apiClient.get("/api/v1/algorithms/daily");
    return HttpResponse.json(response.data);
  } catch (error) {
    logger.error("Mock Get Daily Algorithms Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return HttpResponse.json(
      { error: "Failed to get daily algorithms" },
      { status: 500 }
    );
  }
});

// export const daily = http.get("/api/algorithms/daily", async () => {
//   const algorithms = getDailyAlgorithms();
//   return HttpResponse.json(algorithms);
// });
