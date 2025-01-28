import { apiClient } from "@/lib/api/client";
import { http, HttpResponse } from "msw";

export const daily = http.get("/api/algorithms/daily", async () => {
  try {
    const response = await apiClient.get("/api/v1/algorithms/daily");
    return HttpResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return new HttpResponse(null, { status: 500 });
  }
});

// export const daily = http.get("/api/algorithms/daily", async () => {
//   const algorithms = getDailyAlgorithms();
//   return HttpResponse.json(algorithms);
// });
