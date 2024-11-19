import { http, HttpResponse } from "msw";
import { Algorithm } from "@/types/algorithm";
import { CodeExecutionResponse, TestItem } from "@/types/testRunner";

interface RunCodeRequest {
  code: string;
  language: string;
  algorithmId: string;
}

const mockAlgorithms: Algorithm[] = [
  {
    id: "1234",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "easy",
    files: {
      typescript: [
        {
          name: "solution.ts",
          content:
            "function twoSum(nums: number[], target: number): number[] {\n  // Write your code here\n  return [];\n}",
          isMain: true,
          language: "typescript",
        },
        {
          name: "test.ts",
          content:
            "test('twoSum', () => {\n  expect(twoSum([2,7,11,15], 9)).toEqual([0,1]);\n})",
          isMain: false,
          language: "typescript",
          readOnly: true,
        },
      ],
      python: [
        {
          name: "solution.py",
          content:
            "def two_sum(nums, target):\n    # Write your code here\n    return []",
          isMain: true,
          language: "python",
        },
        {
          name: "test.py",
          content:
            "def test_two_sum():\n    assert two_sum([2,7,11,15], 9) == [0,1]",
          isMain: false,
          language: "python",
          readOnly: true,
        },
      ],
    },
  },
];

// Mock test runner function
function runTests(
  code: string,
  language: string,
  algorithmId: string
): CodeExecutionResponse {
  if (algorithmId === "1234") {
    if (language === "typescript") {
      try {
        const hasLoop = code.includes("for") || code.includes("while");
        const hasReturn = code.includes("return");

        const testItems: TestItem[] = [
          {
            t: "describe",
            v: "Two Sum Tests",
            p: hasLoop && hasReturn,
            items: [
              {
                t: "it",
                v: "should handle basic test case [2,7,11,15], target = 9",
                p: hasLoop && hasReturn,
                items:
                  hasLoop && hasReturn
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
                          t: "error",
                          v: "Error: custom error\n    at likes (test.js:5:9)\n    at Context.<anonymous> (test.js:23:24)\n    at process.processImmediate (node:internal/timers:471:21)",
                          p: false,
                        },
                        {
                          t: "completedin",
                          v: "1",
                          p: true,
                        },
                      ],
              },
              {
                t: "it",
                v: "should handle test case [3,2,4], target = 6",
                p: hasLoop && hasReturn,
                items:
                  hasLoop && hasReturn
                    ? [
                        {
                          t: "completedin",
                          v: "1",
                          p: true,
                        },
                      ]
                    : [
                        {
                          t: "failed",
                          v: "Implementation appears incomplete",
                          p: false,
                        },
                      ],
              },
            ],
          },
        ];

        const passed = hasLoop && hasReturn ? 2 : 0;
        const failed = hasLoop && hasReturn ? 0 : 2;

        const shouldThrow = true;
        if (shouldThrow) {
          throw new Error("Syntax error");
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
            completed: true,
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
      } catch (error) {
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
            error: error instanceof Error ? error.message : "Unknown error",
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
    }
  }

  return {
    type: "execution error",
    stdout: "",
    stderr: "Algorithm or language not supported",
    exitCode: 1,
    wallTime: 0,
    timedOut: false,
    message: "Not implemented",
    token: "mock-token",
    result: {
      serverError: true,
      completed: false,
      output: [],
      successMode: "assertions",
      passed: 0,
      failed: 0,
      errors: 1,
      error: "Algorithm or language not supported",
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

export const handlers = [
  http.get("/api/algorithm/:id", ({ params }) => {
    const { id } = params;
    const algorithm = mockAlgorithms.find((algo) => algo.id === id);

    if (!algorithm) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(algorithm);
  }),

  http.get("/api/algorithms", () => {
    return HttpResponse.json(mockAlgorithms);
  }),

  http.post("/api/code/run", async ({ request }) => {
    const { code, language, algorithmId } =
      (await request.json()) as RunCodeRequest;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = runTests(code, language, algorithmId);
    return HttpResponse.json(result);
  }),
];
