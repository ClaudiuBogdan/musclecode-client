import { http, HttpResponse } from "msw";
import { useMockAlgorithmsStore } from "../../store/algorithms";
import { Algorithm } from "@/types/algorithm";
import { CreateAlgorithmPayload } from "@/types/newAlgorithm";

export const byId = [
  http.get("/api/algorithms/:id", ({ params }) => {
    const { id } = params;
    const algorithm = useMockAlgorithmsStore
      .getState()
      .getAlgorithm(id as string);

    if (!algorithm) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ algorithm });
  }),
  http.put("/api/algorithms/:id", async ({ params, request }) => {
    const { id } = params;
    const payload = (await request.json()) as CreateAlgorithmPayload;
    const store = useMockAlgorithmsStore.getState();
    const existingAlgorithm = store.getAlgorithm(id as string);

    if (!existingAlgorithm) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedAlgorithm: Algorithm = {
      ...existingAlgorithm,
      title: payload.title,
      difficulty: payload.difficulty,
      description: payload.description,
      files: payload.files,
    };

    store.updateAlgorithm(updatedAlgorithm);

    return HttpResponse.json({ algorithm: updatedAlgorithm });
  }),
];
