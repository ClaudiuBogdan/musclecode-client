import { apiClient } from "@/lib/api/client";
import { http, HttpResponse } from "msw";

export const byId = [
  http.get("/api/algorithms/:id", async ({ params }) => {
    const { id } = params;
    try {
      const response = await apiClient.get(`/api/v1/algorithms/${id}`);
      return HttpResponse.json(response.data);
    } catch (error) {
      console.error(error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
  http.put("/api/algorithms/:id", async ({ params, request }) => {
    const { id } = params;
    try {
      const payload = await request.json();
      const response = await apiClient.put(`/api/v1/algorithms/${id}`, payload);
      return HttpResponse.json(response.data);
    } catch (error) {
      console.error(error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
];

// export const byId = [
//   http.get("/api/algorithms/:id", ({ params }) => {
//     const { id } = params;
//     const algorithm = useMockAlgorithmsStore
//       .getState()
//       .getAlgorithm(id as string);

//     if (!algorithm) {
//       return new HttpResponse(null, { status: 404 });
//     }

//     return HttpResponse.json({ algorithm });
//   }),
//   http.put("/api/algorithms/:id", async ({ params, request }) => {
//     const { id } = params;
//     const payload = (await request.json()) as CreateAlgorithmPayload;
//     const store = useMockAlgorithmsStore.getState();
//     const existingAlgorithm = store.getAlgorithm(id as string);

//     if (!existingAlgorithm) {
//       return new HttpResponse(null, { status: 404 });
//     }

//     const updatedAlgorithm: Algorithm = {
//       ...existingAlgorithm,
//       title: payload.title,
//       difficulty: payload.difficulty,
//       description: payload.description,
//       summary: payload.summary,
//       category: payload.category,
//       tags: payload.tags,
//       files: payload.files,
//     };

//     store.updateAlgorithm(updatedAlgorithm);

//     return HttpResponse.json({ algorithm: updatedAlgorithm });
//   }),
// ];
