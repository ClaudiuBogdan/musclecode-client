import { AlgorithmTemplate } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";

export const seedAlgorithms = (): AlgorithmTemplate[] => {
  return [
    {
      id: "1",
      title: "Bubble Sort",
      categories: ["Sorting"],
      tags: ["sorting", "bubble sort"],
      summary:
        "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      lessons: [
        {
          id: "1",
          title: "Bubble Sort",
          content: "Test Content",
        },
      ],
      difficulty: "easy",
      files: [
        {
          id: uuidv4(),
          name: "solution",
          type: "solution",
          content:
            "export function bubbleSort(arr: number[]): number[] {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\nfor (let j = 0; j < n - i - 1; j++) {\n  if (arr[j] > arr[j + 1]) {\n// Swap elements\n[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n  }\n}\n  }\n  return arr;\n}",
          language: "typescript",
          extension: "ts",
          hidden: false,
        },
        {
          id: uuidv4(),
          name: "test",
          type: "test",
          content:
            "import { bubbleSort } from './solution';\n\ntest('bubbleSort', () => {\n  expect(bubbleSort([64, 34, 25, 12, 22, 11, 90])).toEqual([11, 12, 22, 25, 34, 64, 90]);\n})",
          language: "typescript",
          extension: "ts",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution",
          type: "solution",
          content:
            "def bubble_sort(arr):\n  n = len(arr)\n  for i in range(n):\n    for j in range(0, n - i - 1):\n      if arr[j] > arr[j + 1]:\n        arr[j], arr[j + 1] = arr[j + 1], arr[j]\n  return arr\n\nif __name__ == '__main__':\n    print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))",
          language: "python",
          extension: "py",
          hidden: false,
        },
        {
          id: uuidv4(),
          name: "test",
          type: "test",
          content:
            "from solution import bubble_sort\n\ndef test_bubble_sort():\n  assert bubble_sort([64, 34, 25, 12, 22, 11, 90]) == [11, 12, 22, 25, 34, 64, 90]",
          language: "python",
          extension: "py",
          readOnly: true,
          hidden: false,
        },
      ],
    },
  ];
};
