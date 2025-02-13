import { http, HttpResponse } from "msw";
import { AlgorithmFile } from "@/types/algorithm";
import { executionApi } from "@/lib/api/code";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

interface RunCodeRequest {
  files: AlgorithmFile[];
  language: string;
  userId: string;
  submissionId: string;
}

const logger = createLogger({ context: "MockRunApi" });

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
    logger.error("Mock Code Run Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      submissionId,
    });
    return HttpResponse.json({ error: "Failed to run code" }, { status: 500 });
  }
});

export const codeRun = http.post(
  "/api/algorithms/:id/run",
  async ({ request, params }) => {
    try {
      const algorithmId = params.id as string;
      const body = await request.json();

      const response = await apiClient.post(
        `/api/v1/algorithms/${algorithmId}/run`,
        body
      );

      const data = response.data;
      if (data.error) {
        return HttpResponse.json({ error: data.error }, { status: 500 });
      }
      return HttpResponse.json(data);
    } catch (error) {
      logger.error("Mock Code Run Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        algorithmId: params.id,
      });
      return HttpResponse.json(
        { error: "Failed to run code" },
        { status: 500 }
      );
    }
  }
);
