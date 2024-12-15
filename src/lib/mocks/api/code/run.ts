import { http, HttpResponse } from "msw";
import { CodeExecutionResponse, TestItem } from "@/types/testRunner";
import { PythonRuntime } from "@/wasm/services/python-runtime.service";
import {
  TypeScriptRuntime,
  TypeScriptRuntimeResult,
} from "@/wasm/services/typescript-runtime.service";
import {
  JavaScriptRuntime,
  JavaScriptRuntimeResult,
} from "@/wasm/services/javascript-runtime.service";
import axios from "axios";

interface RunCodeRequest {
  code: string;
  language: string;
  userId: string;
  submissionId: string;
}

export const runCode = http.post("/api/code/run", async ({ request }) => {
  const { userId, submissionId, code, language } =
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
      code,
      language,
    });

    const data = response.data;
    console.log("================= data ==================");
    console.log({ data, userId, submissionId, code, language });
    if (data.error) {
      return HttpResponse.json({ error: data.error }, { status: 500 });
    }
    return HttpResponse.json(data);
  } catch (error) {
    return HttpResponse.json({ error: "Failed to run code" }, { status: 500 });
  }
  // const result = createMockTestResponse(code);
  // return HttpResponse.json(result);
});

async function executePythonCode(code: string): Promise<HttpResponse> {
  const runtime = new PythonRuntime({
    stdout: (text) => console.log("Python stdout:", text),
    stderr: (text) => console.error("Python stderr:", text),
  });

  try {
    await runtime.initialize();
    const result = await runtime.execute(code);

    const response: CodeExecutionResponse = {
      type: result.success ? "execution success" : "execution error",
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      exitCode: result.success ? 0 : 1,
      wallTime: 0, // We'll add proper timing later
      timedOut: false,
      message: result.error || "",
      token: "",
      result: {
        serverError: false,
        completed: true,
        output: createTestItemsFromPythonResult(result),
        successMode: "assertions",
        passed: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
        errors: 0,
        error: result.error || null,
        assertions: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        specs: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        unweighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        weighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };

    return HttpResponse.json(response);
  } catch (error) {
    const errorResponse: CodeExecutionResponse = {
      type: "execution error",
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      exitCode: 1,
      wallTime: 0,
      timedOut: false,
      message: "Python execution failed",
      token: "",
      result: {
        serverError: true,
        completed: false,
        output: [],
        successMode: "assertions",
        passed: 0,
        failed: 1,
        errors: 1,
        error: error instanceof Error ? error.message : String(error),
        assertions: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        unweighted: { passed: 0, failed: 1 },
        weighted: { passed: 0, failed: 1 },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };
    return HttpResponse.json(errorResponse);
  } finally {
    runtime.destroy();
  }
}

async function executeTypeScriptCode(code: string): Promise<HttpResponse> {
  const runtime = new TypeScriptRuntime();

  try {
    const result = await runtime.execute(code);

    const response: CodeExecutionResponse = {
      type: result.success ? "execution success" : "execution error",
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      exitCode: result.success ? 0 : 1,
      wallTime: 0,
      timedOut: false,
      message: result.error || "",
      token: "",
      result: {
        serverError: false,
        completed: result.success,
        output: createTestItemsFromTypeScriptResult(result),
        successMode: "assertions",
        passed: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
        errors: result.diagnostics?.length || 0,
        error: result.error || null,
        assertions: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        specs: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        unweighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        weighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };

    return HttpResponse.json(response);
  } catch (error) {
    const errorResponse: CodeExecutionResponse = {
      type: "execution error",
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      exitCode: 1,
      wallTime: 0,
      timedOut: false,
      message: "TypeScript execution failed",
      token: "",
      result: {
        serverError: true,
        completed: false,
        output: [],
        successMode: "assertions",
        passed: 0,
        failed: 1,
        errors: 1,
        error: error instanceof Error ? error.message : String(error),
        assertions: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        unweighted: { passed: 0, failed: 1 },
        weighted: { passed: 0, failed: 1 },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };
    return HttpResponse.json(errorResponse);
  } finally {
    runtime.destroy();
  }
}

async function executeJavaScriptCode(code: string): Promise<HttpResponse> {
  const runtime = new JavaScriptRuntime();

  try {
    const result = await runtime.execute(code);

    const response: CodeExecutionResponse = {
      type: result.success ? "execution success" : "execution error",
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      exitCode: result.success ? 0 : 1,
      wallTime: 0,
      timedOut: false,
      message: result.error || "",
      token: "",
      result: {
        serverError: false,
        completed: result.success,
        output: createTestItemsFromJavaScriptResult(result),
        successMode: "assertions",
        passed: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
        errors: 0,
        error: result.error || null,
        assertions: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        specs: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          hidden: { passed: 0, failed: 0 },
        },
        unweighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        weighted: {
          passed: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
        },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };

    return HttpResponse.json(response);
  } catch (error) {
    const errorResponse: CodeExecutionResponse = {
      type: "execution error",
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      exitCode: 1,
      wallTime: 0,
      timedOut: false,
      message: "JavaScript execution failed",
      token: "",
      result: {
        serverError: true,
        completed: false,
        output: [],
        successMode: "assertions",
        passed: 0,
        failed: 1,
        errors: 1,
        error: error instanceof Error ? error.message : String(error),
        assertions: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
        unweighted: { passed: 0, failed: 1 },
        weighted: { passed: 0, failed: 1 },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };
    return HttpResponse.json(errorResponse);
  } finally {
    runtime.destroy();
  }
}

function createTestItemsFromPythonResult(result: {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout?: string;
  stderr?: string;
}): TestItem[] {
  const items: TestItem[] = [];

  // Add stdout if present
  if (result.stdout) {
    items.push({
      t: "it",
      v: "Standard Output",
      p: true,
      items: [
        {
          t: "passed",
          v: result.stdout,
          p: true,
        },
      ],
    });
  }

  // Add execution result
  items.push({
    t: "it",
    v: "Code Execution",
    p: result.success,
    items: [
      {
        t: result.success ? "passed" : "failed",
        v: result.success
          ? `Result: ${result.result}`
          : `Error: ${result.error || result.stderr || "Execution failed"}`,
        p: result.success,
      },
    ],
  });

  return [
    {
      t: "describe",
      v: "Python Execution",
      p: result.success,
      items,
    },
  ];
}

function createTestItemsFromTypeScriptResult(
  result: TypeScriptRuntimeResult
): TestItem[] {
  const items: TestItem[] = [];

  // Add type checking results if there are diagnostics
  if (result.diagnostics?.length) {
    items.push({
      t: "it",
      v: "Type Checking",
      p: false,
      items: result.diagnostics.map((diagnostic) => ({
        t: "failed",
        v: diagnostic,
        p: false,
      })),
    });
  }

  // Add stdout if present
  if (result.stdout) {
    items.push({
      t: "it",
      v: "Standard Output",
      p: true,
      items: [
        {
          t: "passed",
          v: result.stdout,
          p: true,
        },
      ],
    });
  }

  // Add execution result
  items.push({
    t: "it",
    v: "Code Execution",
    p: result.success,
    items: [
      {
        t: result.success ? "passed" : "failed",
        v: result.success
          ? `Result: ${result.result}`
          : `Error: ${result.error || result.stderr || "Execution failed"}`,
        p: result.success,
      },
    ],
  });

  return [
    {
      t: "describe",
      v: "TypeScript Execution",
      p: result.success,
      items,
    },
  ];
}

function createTestItemsFromJavaScriptResult(
  result: JavaScriptRuntimeResult
): TestItem[] {
  const items: TestItem[] = [];

  // Add stdout if present
  if (result.stdout) {
    items.push({
      t: "it",
      v: "Standard Output",
      p: true,
      items: [
        {
          t: "passed",
          v: result.stdout,
          p: true,
        },
      ],
    });
  }

  // Add execution result
  items.push({
    t: "it",
    v: "Code Execution",
    p: result.success,
    items: [
      {
        t: result.success ? "passed" : "failed",
        v: result.success
          ? `Result: ${result.result}`
          : `Error: ${result.error || result.stderr || "Execution failed"}`,
        p: result.success,
      },
    ],
  });

  return [
    {
      t: "describe",
      v: "JavaScript Execution",
      p: result.success,
      items,
    },
  ];
}
