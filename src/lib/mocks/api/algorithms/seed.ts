import { AlgorithmPreview } from "@/types/algorithm";

export const seedAlgorithms = (): AlgorithmPreview[] => {
  return [
    {
      id: "1",
      title: "Bubble Sort",
      category: "Sorting",
      notes: "",

      description:
        "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      difficulty: "easy",
      nextAlgorithm: {
        id: "2",
        title: "Selection Sort",
      },
    },
    {
      id: "2",
      title: "Selection Sort",
      category: "Sorting",
      notes: "",

      description:
        "A sorting algorithm that selects the smallest element from an unsorted part and puts it at the beginning.",
      difficulty: "easy",
      nextAlgorithm: {
        id: "3",
        title: "Insertion Sort",
      },
    },
    {
      id: "3",
      title: "Insertion Sort",
      category: "Sorting",
      notes: "",

      description:
        "A simple sorting algorithm that builds the final sorted array (or list) one item at a time.",
      difficulty: "easy",
      nextAlgorithm: {
        id: "4",
        title: "Merge Sort",
      },
    },
    {
      id: "4",
      title: "Merge Sort",
      category: "Sorting",
      notes: "",
      description:
        "A divide-and-conquer algorithm that divides the array into two halves, recursively sorts them, and then merges them.",
      difficulty: "medium",
      nextAlgorithm: {
        id: "5",
        title: "Quick Sort",
      },
    },
    {
      id: "5",
      title: "Quick Sort",
      category: "Sorting",
      notes: "",
      description:
        "A divide-and-conquer algorithm that selects a pivot element, partitions the given array around the picked pivot, and then recursively applies the same method to the sub-array of elements with smaller values and separately to the sub-array of elements with greater values.",
      difficulty: "medium",
      nextAlgorithm: {
        id: "6",
        title: "Binary Search",
      },
    },
    {
      id: "6",
      title: "Binary Search",
      category: "Searching",
      notes: "",
      description:
        "A fast search algorithm that finds the position of a target value within a sorted array.",
      difficulty: "easy",
      nextAlgorithm: {
        id: "7",
        title: "Depth-First Search",
      },
    },
    {
      id: "7",
      title: "Depth-First Search",
      category: "Graph Traversal",
      notes: "",
      description:
        "A traversal approach that explores as far as possible along each branch before backtracking.",
      difficulty: "medium",
      nextAlgorithm: {
        id: "8",
        title: "Breadth-First Search",
      },
    },
    {
      id: "8",
      title: "Breadth-First Search",
      category: "Graph Traversal",
      notes: "",
      description:
        "A traversal approach that explores all the nodes at the present depth prior to moving on to nodes at the next depth level.",
      difficulty: "medium",
      nextAlgorithm: {
        id: "9",
        title: "Dijkstra's Algorithm",
      },
    },
    {
      id: "9",
      title: "Dijkstra's Algorithm",
      category: "Graph Algorithms",
      notes: "",
      description:
        "A graph search algorithm that finds the shortest path between nodes in a graph.",
      difficulty: "hard",
      nextAlgorithm: {
        id: "10",
        title: "Floyd-Warshall Algorithm",
      },
    },
    {
      id: "10",
      title: "Floyd-Warshall Algorithm",
      category: "Graph Algorithms",
      notes: "",
      description:
        "An algorithm for finding shortest paths in a weighted graph with positive or negative edge weights.",
      difficulty: "hard",
      nextAlgorithm: {
        id: "11",
        title: "Topological Sort",
      },
    },
    {
      id: "11",
      title: "Topological Sort",
      category: "Graph Algorithms",
      notes: "",
      description:
        "A linear ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge u -> v, vertex u comes before v in the ordering.",
      difficulty: "hard",
      nextAlgorithm: null,
    },
  ];
};
