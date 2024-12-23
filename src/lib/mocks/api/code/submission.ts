import { http, HttpResponse } from "msw";
import { Submission } from "@/types/algorithm";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const codeSubmissions = http.post(
  "/api/algorithms/:id/submissions",
  async ({ request, params }) => {
    try {
      const submissionId = params.id as string;

      const submission = (await request.json()) as Submission;

      const response = await apiClient.post(
        `/api/v1/algorithms/${submissionId}/submissions`,
        submission
      );

      const data = response.data;
      if (data.error) {
        return HttpResponse.json({ error: data.error }, { status: 500 });
      }
      return HttpResponse.json(data);
    } catch (error) {
      console.error(error);
      return HttpResponse.json(
        { error: "Failed to submit code" },
        { status: 500 }
      );
    }
  }
);

export const getSubmission = http.get(
  "/api/algorithms/:id/submissions",
  async ({ params }) => {
    try {
      const submissionId = params.id as string;
      const response = await apiClient.get(
        `/api/v1/algorithms/${submissionId}/submissions`
      );
      return HttpResponse.json(response.data);
    } catch (error) {
      console.error(error);
      return HttpResponse.json(
        { error: "Failed to get submission" },
        { status: 500 }
      );
    }
  }
);
