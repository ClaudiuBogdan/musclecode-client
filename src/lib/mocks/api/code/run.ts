import { http, HttpResponse } from "msw";
import { AlgorithmFile } from "@/types/algorithm";
import { executionApi } from "@/lib/api/code";

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
    const response = await executionApi.post("/execute", {
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
