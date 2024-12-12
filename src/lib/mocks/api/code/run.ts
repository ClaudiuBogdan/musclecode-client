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

interface RunCodeRequest {
  code: string;
  language: string;
  algorithmId: string;
}

export const runCode = http.post("/api/code/run", async ({ request }) => {
  const { code, language } = (await request.json()) as RunCodeRequest;

  if (language === "python") {
    return await executePythonCode(code);
  }

  if (language === "typescript") {
    return await executeTypeScriptCode(code);
  }

  if (language === "javascript") {
    return await executeJavaScriptCode(code);
  }

  // Default behavior for other languages
  const result = runTests(code);
  return HttpResponse.json(result);
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

// Existing test running code for other languages
function runTests(code: string): CodeExecutionResponse {
  const totalPassed = code.split("::pass::").length - 1;
  const totalFailed = code.split("::fail::").length - 1;
  const compilationError = code.includes("::error::");

  const testItems = createMockedTestItem(totalPassed, totalFailed);
  return createMockedResult({
    passed: totalPassed,
    failed: totalFailed,
    compilationError,
    testItems,
  });
}

const createMockedResult = ({
  passed,
  failed,
  compilationError,
  testItems,
}: {
  passed: number;
  failed: number;
  compilationError: boolean;
  testItems: TestItem[];
}): CodeExecutionResponse => {
  if (compilationError) {
    return {
      type: "execution error",
      stderr:
        "\n/workspace/node/test.js:3\nthi is a syntax-error-text\n    ^^\n\nSyntaxError: Unexpected identifier\n    at Object.compileFunction (node:vm:360:18)\n    at wrapSafe (node:internal/modules/cjs/loader:1088:15)\n    at Module._compile (node:internal/modules/cjs/loader:1123:27)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)\n    at Module.load (node:internal/modules/cjs/loader:1037:32)\n    at Module._load (node:internal/modules/cjs/loader:878:12)\n    at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:169:29)\n    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)\n    at async Promise.all (index 0)\n    at async ESMLoader.import (node:internal/modules/esm/loader:530:24)\n    at async importModuleDynamicallyWrapper (node:internal/vm/module:438:15)\n    at async formattedImport (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:9:14)\n    at async exports.requireOrImport (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:42:28)\n    at async exports.loadFilesAsync (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:100:20)\n    at async singleRun (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/cli/run-helpers.js:125:3)\n    at async exports.handler (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/cli/run.js:370:5)\n",
      stdout: "",
      exitCode: 1,
      wallTime: 0,
      timedOut: false,
      message: "Runtime error occurred",
      token: "mock-token",
      result: {
        serverError: true,
        completed: false,
        output: [],
        successMode: "assertions",
        passed: 0,
        failed: 0,
        errors: 1,
        error: "Unknown error",
        assertions: {
          passed: 0,
          failed: 0,
          hidden: { passed: 0, failed: 0 },
        },
        specs: {
          passed: 0,
          failed: 0,
          hidden: { passed: 0, failed: 0 },
        },
        unweighted: { passed: 0, failed: 0 },
        weighted: { passed: 0, failed: 0 },
        timedOut: false,
        wallTime: 0,
        testTime: 0,
        tags: null,
      },
    };
  }

  return {
    type: "execution success",
    stdout: "",
    stderr: "",
    exitCode: passed > 0 ? 0 : 1,
    wallTime: 100,
    timedOut: false,
    message: "",
    token: "mock-token",
    result: {
      serverError: false,
      completed: failed === 0,
      output: testItems,
      successMode: "assertions",
      passed,
      failed,
      errors: 0,
      error: null,
      assertions: {
        passed,
        failed,
        hidden: { passed: 0, failed: 0 },
      },
      specs: {
        passed,
        failed,
        hidden: { passed: 0, failed: 0 },
      },
      unweighted: { passed, failed },
      weighted: { passed, failed },
      timedOut: false,
      wallTime: 100,
      testTime: 2,
      tags: null,
    },
  };
};

const createMockedTestItem = (passed: number, failed: number): TestItem[] => {
  const totalTests = passed + failed;
  const testItems: TestItem[] = [];

  for (let i = 0; i < totalTests; i++) {
    const isPassed = i < passed;
    testItems.push({
      t: "it",
      v: `Test case ${i + 1}`,
      p: isPassed,
      items: isPassed
        ? [
            {
              t: "passed",
              v: "Test Passed",
              p: true,
            },
            {
              t: "completedin",
              v: "1",
              p: true,
            },
          ]
        : [
            {
              t: "failed",
              v: "Test Failed",
              p: false,
            },
            {
              t: "completedin",
              v: "1",
              p: true,
            },
          ],
    });
  }

  return [
    {
      t: "describe",
      v: "Test Suite",
      p: failed === 0,
      items: testItems,
    },
  ];
};
