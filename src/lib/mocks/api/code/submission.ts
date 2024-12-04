import { http, HttpResponse } from "msw";
import { mockedSubmissionsStore } from "../../store/submissions";
import { Submission } from "@/types/algorithm";

export const codeSubmissions = http.post(
  "/api/algorithms/:id/submissions",
  async ({ request, params }) => {
    const submission = (await request.json()) as Submission;
    const algorithmId = params.id as string;
    mockedSubmissionsStore.getState().addSubmission(algorithmId, submission);
    return HttpResponse.json({ success: true });
  }
);

export const getSubmission = http.get(
  "/api/algorithms/:id/submissions",
  async ({ params }) => {
    const algorithmId = params.id as string;
    const submission = mockedSubmissionsStore
      .getState()
      .getSubmission(algorithmId);
    return HttpResponse.json(submission);
  }
);
