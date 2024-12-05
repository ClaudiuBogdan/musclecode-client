import { useQuery } from "@tanstack/react-query";
import { Submission } from "@/types/algorithm";
import { isHtmlResponse } from "@/lib/utils/validation";

const fetchSubmissions = async (algorithmId: string): Promise<Submission[]> => {
  const response = await fetch(`/api/algorithms/${algorithmId}/submissions`);

  // Check if response is HTML instead of JSON
  const contentType = response.headers.get("content-type");
  if (isHtmlResponse(contentType)) {
    throw new Error("Invalid server response");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to parse server response");
  }
};

export const useSubmissions = (algorithmId: string) => {
  return useQuery({
    queryKey: ["submissions", algorithmId],
    queryFn: () => fetchSubmissions(algorithmId),
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
