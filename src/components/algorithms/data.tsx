import {
  Brain,
  CircleSlash,
  Clock,
  Code2,
  GraduationCap,
  Star,
  ListTree,
  Type,
  Link,
  Network,
  Calculator,
  SortAsc,
  Search as SearchIcon,
  Binary,
  Repeat,
  SlidersHorizontal,
} from "lucide-react";

export const categories = [
  {
    value: "array",
    label: "Array",
    icon: Code2,
  },
  {
    value: "string",
    label: "String",
    icon: Type,
  },
  {
    value: "linked-list",
    label: "Linked List",
    icon: Link,
  },
  {
    value: "tree",
    label: "Tree",
    icon: ListTree,
  },
  {
    value: "graph",
    label: "Graph",
    icon: Network,
  },
  {
    value: "dynamic-programming",
    label: "Dynamic Programming",
    icon: Brain,
  },
  {
    value: "math",
    label: "Math",
    icon: Calculator,
  },
  {
    value: "sorting",
    label: "Sorting",
    icon: SortAsc,
  },
  {
    value: "search",
    label: "Search",
    icon: SearchIcon,
  },
  {
    value: "bit-manipulation",
    label: "Bit Manipulation",
    icon: Binary,
  },
  {
    value: "recursion",
    label: "Recursion",
    icon: Repeat,
  },
  {
    value: "sliding-window",
    label: "Sliding Window",
    icon: SlidersHorizontal,
  },
];

export const difficulties = [
  {
    label: "Easy",
    value: "easy",
    icon: Star,
  },
  {
    label: "Medium", 
    value: "medium",
    icon: GraduationCap,
  },
  {
    label: "Hard",
    value: "hard",
    icon: Brain,
  },
]

export const statuses = [
  {
    value: "not-started",
    label: "Not Started",
    icon: CircleSlash,
  },
  {
    value: "in-progress",
    label: "In Progress",
    icon: Clock,
  },
  {
    value: "completed",
    label: "Completed",
    icon: Star,
  },
]
