import { http, HttpResponse } from "msw";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const daily = http.get("/api/algorithms/daily", async () => {
  try {
    const response = await apiClient.get("/api/algorithms/daily");
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

