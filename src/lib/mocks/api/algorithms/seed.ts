import { Algorithm } from "@/types/algorithm";
import { v4 as uuidv4 } from "uuid";
export const seedAlgorithms = (): Algorithm[] => {
  return [
    {
      id: "1",
      title: "Bubble Sort",
      category: "Sorting",
      tags: ["sorting", "bubble sort"],
      notes: `
# Bubble Sort

Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.
      `,
      completed: false,
      summary:
        "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      description: `
# Bubble Sort

Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.

## How it works:

1. Start with an unsorted array of n elements.
2. Compare the first two elements of the array.
3. If the first element is greater than the second element, swap them.
4. Move to the next pair of adjacent elements, repeat steps 2-3 until the end of the array.
5. Repeat steps 1-4 for n-1 passes.

## Example:

\`\`\`
Initial array: [64, 34, 25, 12, 22, 11, 90]

Pass 1: [34, 25, 12, 22, 11, 64, 90]
Pass 2: [25, 12, 22, 11, 34, 64, 90]
Pass 3: [12, 22, 11, 25, 34, 64, 90]
Pass 4: [12, 11, 22, 25, 34, 64, 90]
Pass 5: [11, 12, 22, 25, 34, 64, 90]

Sorted array: [11, 12, 22, 25, 34, 64, 90]
\`\`\`

## Time Complexity:
- Worst and Average Case: O(n^2)
- Best Case: O(n) when the array is already sorted

## Space Complexity:
- O(1) as only a single additional memory space is required for the swapping temp variable.

`,
      difficulty: "easy",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "function bubbleSort(arr: number[]): number[] {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\nfor (let j = 0; j < n - i - 1; j++) {\n  if (arr[j] > arr[j + 1]) {\n// Swap elements\n[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n  }\n}\n  }\n  return arr;\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('bubbleSort', () => {\n  expect(bubbleSort([64, 34, 25, 12, 22, 11, 90])).toEqual([11, 12, 22, 25, 34, 64, 90]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "def bubble_sort(arr):\nn = len(arr)\nfor i in range(n):\nfor j in range(0, n - i - 1):\nif arr[j] > arr[j + 1]:\narr[j], arr[j + 1] = arr[j + 1], arr[j]\nreturn arr",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_bubble_sort():\nassert bubble_sort([64, 34, 25, 12, 22, 11, 90]) == [11, 12, 22, 25, 34, 64, 90]",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "2",
      title: "Selection Sort",
      category: "Sorting",
      tags: ["sorting", "selection sort"],
      notes: `
# Selection Sort

Selection Sort is a simple sorting algorithm that divides the input list into two parts: a sorted portion at the left end and an unsorted portion at the right end. Initially, the sorted portion is empty and the unsorted portion is the entire list.
      `,
      completed: false,
      summary:
        "A sorting algorithm that selects the smallest element from an unsorted part and puts it at the beginning.",
      description: `
# Selection Sort

Selection Sort is a simple sorting algorithm that divides the input list into two parts: a sorted portion at the left end and an unsorted portion at the right end. Initially, the sorted portion is empty and the unsorted portion is the entire list.

## How it works:

1. Find the smallest element in the unsorted portion.
2. Swap it with the first element of the unsorted portion.
3. Move the boundary between the sorted and unsorted portions one element to the right.
4. Repeat steps 1-3 until the entire list is sorted.

## Example:

\`\`\`
Initial array: [64, 25, 12, 22, 11]

Pass 1: [11, 25, 12, 22, 64]
Pass 2: [11, 12, 25, 22, 64]
Pass 3: [11, 12, 22, 25, 64]
Pass 4: [11, 12, 22, 25, 64]

Sorted array: [11, 12, 22, 25, 64]
\`\`\`

## Time Complexity:
- O(n^2) for all cases (worst, average, and best)

## Space Complexity:
- O(1) as it sorts in-place

`,
      difficulty: "easy",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "function selectionSort(arr: number[]): number[] {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\nlet minIdx = i;\nfor (let j = i + 1; j < n; j++) {\n  if (arr[j] < arr[minIdx]) {\nminIdx = j;\n  }\n}\nif (minIdx !== i) {\n  [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n}\n  }\n  return arr;\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('selectionSort', () => {\n  expect(selectionSort([64, 25, 12, 22, 11])).toEqual([11, 12, 22, 25, 64]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "def selection_sort(arr):\nn = len(arr)\nfor i in range(n):\nmin_idx = i\nfor j in range(i + 1, n):\nif arr[j] < arr[min_idx]:\nmin_idx = j\narr[i], arr[min_idx] = arr[min_idx], arr[i]\nreturn arr",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_selection_sort():\nassert selection_sort([64, 25, 12, 22, 11]) == [11, 12, 22, 25, 64]",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "3",
      title: "Insertion Sort",
      category: "Sorting",
      tags: ["sorting", "insertion sort"],
      notes: "",
      summary:
        "A simple sorting algorithm that builds the final sorted array one item at a time.",
      description: `
# Insertion Sort

Insertion Sort is a simple sorting algorithm that builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.

## How it works:

1. Start with the second element (assume the first element is already sorted).
2. Compare the second element with the first and insert it into the correct position.
3. Continue to the next element and insert it into the correct position in the sorted portion.
4. Repeat step 3 until no input elements remain.

## Example:

\`\`\`
Initial array: [5, 2, 4, 6, 1, 3]

Pass 1: [2, 5, 4, 6, 1, 3]
Pass 2: [2, 4, 5, 6, 1, 3]
Pass 3: [2, 4, 5, 6, 1, 3]
Pass 4: [1, 2, 4, 5, 6, 3]
Pass 5: [1, 2, 3, 4, 5, 6]

Sorted array: [1, 2, 3, 4, 5, 6]
\`\`\`

## Time Complexity:
- Worst and Average Case: O(n^2)
- Best Case: O(n) when the array is already sorted

## Space Complexity:
- O(1) as it sorts in-place

`,
      difficulty: "easy",
      completed: false,
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "function insertionSort(arr: number[]): number[] {\n  for (let i = 1; i < arr.length; i++) {\nlet key = arr[i];\nlet j = i - 1;\nwhile (j >= 0 && arr[j] > key) {\n  arr[j + 1] = arr[j];\n  j--;\n}\narr[j + 1] = key;\n  }\n  return arr;\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('insertionSort', () => {\n  expect(insertionSort([5, 2, 4, 6, 1, 3])).toEqual([1, 2, 3, 4, 5, 6]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "def insertion_sort(arr):\nfor i in range(1, len(arr)):\nkey = arr[i]\nj = i - 1\nwhile j >= 0 and arr[j] > key:\narr[j + 1] = arr[j]\nj -= 1\narr[j + 1] = key\nreturn arr",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_insertion_sort():\nassert insertion_sort([5, 2, 4, 6, 1, 3]) == [1, 2, 3, 4, 5, 6]",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "4",
      title: "Merge Sort",
      category: "Sorting",
      tags: ["sorting", "merge sort"],
      completed: false,
      notes: "",
      summary:
        "A divide-and-conquer algorithm that divides the array into two halves, recursively sorts them, and then merges them.",
      description: `
# Merge Sort

Merge Sort is an efficient, stable, divide-and-conquer sorting algorithm. It works by dividing the unsorted list into n sublists, each containing one element, then repeatedly merging sublists to produce new sorted sublists until there is only one sublist remaining.

## How it works:

1. Divide the unsorted list into n sublists, each containing one element (a list of one element is considered sorted).
2. Repeatedly merge sublists to produce new sorted sublists until there is only one sublist remaining. This will be the sorted list.

## Example:

\`\`\`
Initial array: [38, 27, 43, 3, 9, 82, 10]

Divide: [38, 27, 43, 3] [9, 82, 10]
Divide: [38, 27] [43, 3] [9, 82] [10]
Divide: [38] [27] [43] [3] [9] [82] [10]

Merge: [27, 38] [3, 43] [9, 82] [10]
Merge: [3, 27, 38, 43] [9, 10, 82]
Merge: [3, 9, 10, 27, 38, 43, 82]

Sorted array: [3, 9, 10, 27, 38, 43, 82]
\`\`\`

## Time Complexity:
- O(n log n) for all cases (worst, average, and best)

## Space Complexity:
- O(n) as it requires additional space for merging

`,
      difficulty: "medium",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "function mergeSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n\n  return merge(left, right);\n}\n\nfunction merge(left: number[], right: number[]): number[] {\n  let result = [];\n  let leftIndex = 0;\n  let rightIndex = 0;\n\n  while (leftIndex < left.length && rightIndex < right.length) {\nif (left[leftIndex] < right[rightIndex]) {\n  result.push(left[leftIndex]);\n  leftIndex++;\n} else {\n  result.push(right[rightIndex]);\n  rightIndex++;\n}\n  }\n\n  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('mergeSort', () => {\n  expect(mergeSort([38, 27, 43, 3, 9, 82, 10])).toEqual([3, 9, 10, 27, 38, 43, 82]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "def quick_sort(arr):\nif len(arr) <= 1:\nreturn arr\npivot = arr[len(arr) // 2]\nleft = [x for x in arr if x < pivot]\nmiddle = [x for x in arr if x == pivot]\nright = [x for x in arr if x > pivot]\nreturn quick_sort(left) + middle + quick_sort(right)",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_quick_sort():\nassert quick_sort([10, 7, 8, 9, 1, 5]) == [1, 5, 7, 8, 9, 10]",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "6",
      title: "Binary Search",
      category: "Searching",
      tags: ["searching", "binary search"],
      completed: false,
      notes: "",
      summary:
        "A fast search algorithm that finds the position of a target value within a sorted array.",
      description: `
# Binary Search

Binary Search is an efficient algorithm for searching a sorted array by repeatedly dividing the search interval in half. It works by comparing the middle element of the array with the target value. If the target value matches the middle element, the position is returned. If the target value is less or more than the middle element, the search continues in the lower or upper half of the array, respectively.

## How it works:

1. Compare the target value to the middle element of the array.
2. If the target value equals the middle element, the search is complete.
3. If the target value is less than the middle element, repeat the search on the lower half of the array.
4. If the target value is greater than the middle element, repeat the search on the upper half of the array.
5. If the search ends with an empty half-array, the target value is not in the array.

## Example:

\`\`\`
Sorted array: [1, 3, 4, 6, 8, 9, 11]
Target value: 6

Step 1: Middle element is 6. Target found!

Sorted array: [1, 3, 4, 6, 8, 9, 11]
Target value: 1

Step 1: Middle element is 6. 1 < 6, so search lower half.
Step 2: Middle element is 3. 1 < 3, so search lower half.
Step 3: Middle element is 1. Target found!
\`\`\`

## Time Complexity:
- O(log n) for all cases

## Space Complexity:
- O(1) for iterative implementation
- O(log n) for recursive implementation due to the call stack

`,
      difficulty: "easy",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content: `
const num = 1;
const str = "1";

const total = 2;

function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) {
            return mid; // Target found, return its index
        } else if (arr[mid] < target) {
            left = mid + 1; // Move to the right half
        } else {
            right = mid - 1; // Move to the left half
        }
    }

    return -1; // Target not found
}

console.log(binarySearch([1, 3, 4, 6, 8, 9, 11], 6)); // Output: 3

          `,
          language: "javascript",
          required: true,
        },

        {
          id: uuidv4(),
          name: "solution.go",
          type: "solution",
          content: `
func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr) - 1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}
fmt.Println(binarySearch([]int{1, 3, 4, 6, 8, 9, 11}, 6))
          `,
          language: "go",
          required: true,
        },
        {
          id: uuidv4(),
          name: "solution.js",
          type: "solution",
          content: `
const num: number = 1
const str: string = "1"

const total: number = 2


function binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) {
            return mid; // Target found, return its index
        } else if (arr[mid] < target) {
            left = mid + 1; // Move to the right half
        } else {
            right = mid - 1; // Move to the left half
        }
    }

    return -1; // Target not found
}
console.log(binarySearch([1, 3, 4, 6, 8, 9, 11], 6))
          `,
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('binarySearch', () => {\n  expect(binarySearch([1, 3, 4, 6, 8, 9, 11], 6)).toBe(3);\n  expect(binarySearch([1, 3, 4, 6, 8, 9, 11], 5)).toBe(-1);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content: `
def binary_search(arr, target):
  left, right = 0, len(arr) - 1
  while left <= right:
      mid = (left + right) // 2
      if arr[mid] == target:
          return mid
      elif arr[mid] < target:
          left = mid + 1
      else:
          right = mid - 1
  return -1  # Target not found
  `,
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_binary_search():\nassert binary_search([1, 3, 4, 6, 8, 9, 11], 6) == 3\nassert binary_search([1, 3, 4, 6, 8, 9, 11], 5) == -1",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "7",
      title: "Depth-First Search",
      category: "Graph Traversal",
      tags: ["graph traversal", "depth-first search"],
      notes: "",
      completed: false,
      summary:
        "A traversal approach that explores as far as possible along each branch before backtracking.",
      description: `
# Depth-First Search (DFS)

Depth-First Search is an algorithm for traversing or searching tree or graph data structures. It starts at a root node and explores as far as possible along each branch before backtracking.

## How it works:

1. Start at the root (or any arbitrary node for a graph).
2. Mark the current node as visited.
3. Recursively traverse all the adjacent unvisited nodes.
4. Repeat steps 2-3 until all nodes are visited.

## Example:

Consider the following graph:

\`\`\`
A
   / \\
  B   C
 / \\   \\
D   E   F
\`\`\`

DFS traversal starting from A:
A -> B -> D -> E -> C -> F

## Time Complexity:
- O(V + E) where V is the number of vertices and E is the number of edges in the graph

## Space Complexity:
- O(V) in the worst case, when the graph is a tree and completely unbalanced

`,
      difficulty: "medium",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "class Graph {\n  private adjacencyList: Map<number, number[]>;\n\n  constructor() {\nthis.adjacencyList = new Map();\n  }\n\n  addVertex(vertex: number) {\nif (!this.adjacencyList.has(vertex)) {\n  this.adjacencyList.set(vertex, []);\n}\n  }\n\n  addEdge(vertex1: number, vertex2: number) {\nthis.adjacencyList.get(vertex1)?.push(vertex2);\nthis.adjacencyList.get(vertex2)?.push(vertex1);\n  }\n\n  dfs(start: number): number[] {\nconst visited: Set<number> = new Set();\nconst result: number[] = [];\n\nconst dfsHelper = (vertex: number) => {\n  visited.add(vertex);\n  result.push(vertex);\n\n  this.adjacencyList.get(vertex)?.forEach(neighbor => {\nif (!visited.has(neighbor)) {\n  dfsHelper(neighbor);\n}\n  });\n};\n\ndfsHelper(start);\nreturn result;\n  }\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('depthFirstSearch', () => {\n  const graph = new Graph();\n  [0, 1, 2, 3, 4, 5].forEach(v => graph.addVertex(v));\n  [[0, 1], [0, 2], [1, 3], [2, 4], [2, 5]].forEach(([v1, v2]) => graph.addEdge(v1, v2));\n  expect(graph.dfs(0)).toEqual([0, 1, 3, 2, 4, 5]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "class Graph:\ndef __init__(self):\nself.adjacency_list = {}\n\ndef add_vertex(self, vertex):\nif vertex not in self.adjacency_list:\nself.adjacency_list[vertex] = []\n\ndef add_edge(self, vertex1, vertex2):\nself.adjacency_list[vertex1].append(vertex2)\nself.adjacency_list[vertex2].append(vertex1)\n\ndef dfs(self, start):\nvisited = set()\nresult = []\n\ndef dfs_helper(vertex):\nvisited.add(vertex)\nresult.append(vertex)\n\nfor neighbor in self.adjacency_list[vertex]:\nif neighbor not in visited:\ndfs_helper(neighbor)\n\ndfs_helper(start)\nreturn result",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_depth_first_search():\ngraph = Graph()\nfor v in range(6):\ngraph.add_vertex(v)\nfor v1, v2 in [(0, 1), (0, 2), (1, 3), (2, 4), (2, 5)]:\ngraph.add_edge(v1, v2)\nassert graph.dfs(0) == [0, 1, 3, 2, 4, 5]",
          language: "python",
          readOnly: true,
        },
      ],
    },
    {
      id: "8",
      title: "Breadth-First Search",
      category: "Graph Traversal",
      tags: ["graph traversal", "breadth-first search"],
      notes: "",
      completed: false,
      summary:
        "A traversal approach that explores all the nodes at the present depth prior to moving on to nodes at the next depth level.",
      description: `
# Breadth-First Search (BFS)

Breadth-First Search is an algorithm for traversing or searching tree or graph data structures. It starts at a root node and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.

## How it works:

1. Start at the root (or any arbitrary node for a graph).
2. Explore all the neighboring unvisited nodes at the present depth.
3. Move to the next level of nodes.
4. Repeat steps 2-3 until all nodes are visited.

## Example:

Consider the following graph:

\`\`\`
A
   / \\
  B   C
 / \\   \\
D   E   F
\`\`\`

BFS traversal starting from A:
A -> B -> C -> D -> E -> F

## Time Complexity:
- O(V + E) where V is the number of vertices and E is the number of edges in the graph

## Space Complexity:
- O(V) where V is the number of vertices in the graph

`,
      difficulty: "medium",
      files: [
        {
          id: uuidv4(),
          name: "solution.ts",
          type: "solution",
          content:
            "class Graph {\n  private adjacencyList: Map<number, number[]>;\n\n  constructor() {\nthis.adjacencyList = new Map();\n  }\n\n  addVertex(vertex: number) {\nif (!this.adjacencyList.has(vertex)) {\n  this.adjacencyList.set(vertex, []);\n}\n  }\n\n  addEdge(vertex1: number, vertex2: number) {\nthis.adjacencyList.get(vertex1)?.push(vertex2);\nthis.adjacencyList.get(vertex2)?.push(vertex1);\n  }\n\n  bfs(start: number): number[] {\nconst visited: Set<number> = new Set();\nconst queue: number[] = [];\nconst result: number[] = [];\n\nvisited.add(start);\nqueue.push(start);\n\nwhile (queue.length > 0) {\n  const vertex = queue.shift()!;\n  result.push(vertex);\n\n  this.adjacencyList.get(vertex)?.forEach(neighbor => {\nif (!visited.has(neighbor)) {\n  visited.add(neighbor);\n  queue.push(neighbor);\n}\n  });\n}\n\nreturn result;\n  }\n}",
          language: "typescript",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.ts",
          type: "test",
          content:
            "test('breadthFirstSearch', () => {\n  const graph = new Graph();\n  [0, 1, 2, 3, 4, 5].forEach(v => graph.addVertex(v));\n  [[0, 1], [0, 2], [1, 3], [2, 4], [2, 5]].forEach(([v1, v2]) => graph.addEdge(v1, v2));\n  expect(graph.bfs(0)).toEqual([0, 1, 2, 3, 4, 5]);\n})",
          language: "typescript",
          readOnly: true,
        },
        {
          id: uuidv4(),
          name: "solution.py",
          type: "solution",
          content:
            "from collections import deque\n\nclass Graph:\ndef __init__(self):\nself.adjacency_list = {}\n\ndef add_vertex(self, vertex):\nif vertex not in self.adjacency_list:\nself.adjacency_list[vertex] = []\n\ndef add_edge(self, vertex1, vertex2):\nself.adjacency_list[vertex1].append(vertex2)\nself.adjacency_list[vertex2].append(vertex1)\n\ndef bfs(self, start):\nvisited = set()\nqueue = deque([start])\nresult = []\n\nvisited.add(start)\n\nwhile queue:\nvertex = queue.popleft()\nresult.append(vertex)\n\nfor neighbor in self.adjacency_list[vertex]:\nif neighbor not in visited:\nvisited.add(neighbor)\nqueue.append(neighbor)\n\nreturn result",
          language: "python",
          required: true,
        },
        {
          id: uuidv4(),
          name: "test.py",
          type: "test",
          content:
            "def test_breadth_first_search():\ngraph = Graph()\nfor v in range(6):\ngraph.add_vertex(v)\nfor v1, v2 in [(0, 1), (0, 2), (1, 3), (2, 4), (2, 5)]:\ngraph.add_edge(v1, v2)\nassert graph.bfs(0) == [0, 1, 2, 3, 4, 5]",
          language: "python",
          readOnly: true,
        },
      ],
    },
  ];
};