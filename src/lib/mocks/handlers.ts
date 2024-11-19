import { http, HttpResponse } from "msw";
import { Algorithm } from "@/types/algorithm";

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
function runTests(code: string, language: string, algorithmId: string) {
  // This is a simple mock implementation
  // In a real application, you'd want more sophisticated test running

  if (algorithmId === "1234") {
    // Two Sum
    if (language === "typescript") {
      // Basic test case for Two Sum
      try {
        // Simple validation - check if the code includes certain keywords
        const hasLoop = code.includes("for") || code.includes("while");
        const hasReturn = code.includes("return");

        if (!hasLoop || !hasReturn) {
          return {
            success: false,
            output: "Code execution failed",
            error: "Implementation appears incomplete",
            testResults: [
              {
                name: "Basic Test",
                passed: false,
                message: "Solution appears incomplete",
              },
            ],
          };
        }

        return {
          success: true,
          output: "All tests passed!",
          testResults: [
            {
              name: "Test Case 1: [2,7,11,15], target = 9",
              passed: true,
            },
            {
              name: "Test Case 2: [3,2,4], target = 6",
              passed: true,
            },
          ],
        };
      } catch (error) {
        return {
          success: false,
          output: "Code execution failed",
          error: error instanceof Error ? error.message : "Unknown error",
          testResults: [
            {
              name: "Code Execution",
              passed: false,
              message: "Runtime error occurred",
            },
          ],
        };
      }
    }
  }

  return {
    success: false,
    output: "Algorithm or language not supported",
    error: "Not implemented",
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
