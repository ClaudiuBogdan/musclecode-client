import { http } from "msw";
import { HttpResponse } from "msw";
import { createAlgorithm } from "./fn";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";

export const createAlgorithmApi = http.post(
  "/api/algorithms",
  async ({ request }) => {
    const payload = (await request.json()) as CreateAlgorithmPayload;
      const algorithm = await createAlgorithm(payload);
      return HttpResponse.json(algorithm);
  }
);
