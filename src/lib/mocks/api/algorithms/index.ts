import { http, HttpResponse } from "msw";
import { useMockAlgorithmsStore } from "../../store/algorithms";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const all = http.get("/api/algorithms", async () => {
  try {
    const response = await apiClient.get("/api/v1/algorithms");
    return HttpResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return new HttpResponse(null, { status: 500 });
  }
});


export const allMock = http.get("/api/algorithms", () => {
  const store = useMockAlgorithmsStore.getState();
  const algorithms = store.algorithms;
  return HttpResponse.json(algorithms);
});
