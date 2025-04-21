import { useQuery } from "@tanstack/react-query";
import { 
  fetchModule, 
  fetchModules, 
  fetchLesson, 
  fetchExercise
} from "./api";

export function useModules() {
  return useQuery({
    queryKey: ["content", "modules"],
    queryFn: () => fetchModules(),
  });
}

export function useModule(id: string) {
  return useQuery({
    queryKey: ["content", "module", id],
    queryFn: () => fetchModule(id),
    enabled: !!id,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["content", "lesson", id],
    queryFn: () => fetchLesson(id),
    enabled: !!id,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["content", "exercise", id],
    queryFn: () => fetchExercise(id),
    enabled: !!id,
  });
} 