import { getSubmissions } from "@/lib/api/code";
import { useQuery } from "@tanstack/react-query";

export function useSubmissions(algorithmId: string) {
  return useQuery({
    queryKey: ["submissions", algorithmId],
    queryFn: () => getSubmissions(algorithmId),
  });
}
