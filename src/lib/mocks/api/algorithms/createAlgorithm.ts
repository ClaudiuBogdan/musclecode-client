import { http } from "msw";
import { HttpResponse } from "msw";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MockAlgorithmAPI");

export const createAlgorithmApi = http.post(
  "/api/algorithms",
  async ({ request }) => {
    try {
      const payload = (await request.json()) as CreateAlgorithmPayload;
      logger.debug("Algorithm Creation Started", {
        title: payload.title,
        category: payload.category,
        difficulty: payload.difficulty,
      });

      const response = await apiClient.post("/api/v1/algorithms", payload);

      logger.info("Algorithm Creation Completed", {
        title: payload.title,
        category: payload.category,
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
