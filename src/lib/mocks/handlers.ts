import { http, HttpResponse } from "msw";
import { Algorithm } from "@/types/algorithm";

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
];
