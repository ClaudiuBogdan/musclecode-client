import {
  Brain,
  CircleSlash,
  Clock,
  Code2,
  FileCode2,
  GraduationCap,
  Star,
} from "lucide-react"

export const categories = [
  {
    value: "sorting",
    label: "Sorting",
    icon: Code2,
  },
  {
    value: "searching",
    label: "Searching", 
    icon: FileCode2,
  },
  {
    value: "dynamic-programming",
    label: "Dynamic Programming",
    icon: Brain,
  },
  // Add other categories as needed
]

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
