import type { Rating } from "@/types/algorithm";

export const difficultyColors: Record<Rating, string> = {
  again: "bg-red-500 text-white",
  hard: "bg-orange-500 text-white",
  good: "bg-green-500 text-white",
  easy: "bg-blue-500 text-white",
};
