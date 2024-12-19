import { http } from "msw";
import { HttpResponse } from "msw";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const createAlgorithmApi = http.post(
  "/api/algorithms",
  async ({ request }) => {
    const payload = (await request.json()) as CreateAlgorithmPayload;
    try {
      const response = await apiClient.post("/api/algorithms", payload);
      return HttpResponse.json(response.data);
    } catch (error) {
      console.error(error);
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
