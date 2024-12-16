import { http, HttpResponse } from "msw";
import axios from "axios";
import { AlgorithmFile } from "@/types/algorithm";

interface RunCodeRequest {
  files: AlgorithmFile[];
  language: string;
  userId: string;
  submissionId: string;
}

export const runCode = http.post("/api/code/run", async ({ request }) => {
  const { userId, submissionId, files, language } =
    (await request.json()) as RunCodeRequest;

  try {
    const apiClient = axios.create({
      baseURL: "http://localhost:3002",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await apiClient.post("/execute", {
      userId,
      submissionId,
      files,
      language,
    });

    const data = response.data;
    if (data.error) {
      return HttpResponse.json({ error: data.error }, { status: 500 });
    }
    return HttpResponse.json(data);
  } catch (error) {
    console.error(error);
    return HttpResponse.json({ error: "Failed to run code" }, { status: 500 });
  }
});
