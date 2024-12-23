import { useQuery } from "@tanstack/react-query";
import { getSubmissions } from "@/lib/api/code";

export const useSubmissions = (algorithmId: string) => {
  return useQuery({
    queryKey: ["submissions", algorithmId],
    queryFn: () => getSubmissions(algorithmId),
    retry: (failureCount, error) => {
      // Don't retry automatically if we got HTML response
      if (error.message === "Invalid server response") {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
