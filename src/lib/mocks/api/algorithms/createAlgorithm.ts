import { http } from "msw";
import { HttpResponse } from "msw";

import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

import type { CreateAlgorithmPayload } from "@/types/newAlgorithm";

const logger = createLogger("MockAlgorithmAPI");

export const createAlgorithmApi = http.post(
  "/api/algorithms",
  async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateAlgorithmPayload;
      logger.debug("Algorithm Creation Started", {
        title: payload.title,
        categories: payload.categories,
        difficulty: payload.difficulty,
      });

      const response = await apiClient.post("/api/v1/algorithms", payload);

      logger.info("Algorithm Creation Completed", {
        title: payload.title,
        categories: payload.categories,
      });

      return HttpResponse.json(response.data);
    } catch (error) {
      logger.error("Algorithm Creation Failed", error as Error);
      return new HttpResponse(null, { status: 500 });
    }
  }
);

// export const createAlgorithmApi = http.post(
//   "/api/algorithms",
//   async ({ request }) => {
//     const payload = (await request.json()) as CreateAlgorithmPayload;
//       const algorithm = await createAlgorithm(payload);
//       return HttpResponse.json(algorithm);
//   }
// );
