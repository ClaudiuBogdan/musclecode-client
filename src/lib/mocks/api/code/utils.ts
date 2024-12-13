import { CodeExecutionResponse, TestItem } from "@/types/testRunner";

// Existing test running code for other languages
export function createMockTestResponse(code: string): CodeExecutionResponse {
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

export const createMockedResult = ({
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

export const createMockedTestItem = (
  passed: number,
  failed: number
): TestItem[] => {
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
