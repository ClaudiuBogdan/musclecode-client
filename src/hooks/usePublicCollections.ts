import { useQuery } from "@tanstack/react-query";
import { Collection } from "@/types/collection";
import { apiClient } from "@/lib/api/client";

interface UsePublicCollectionsOptions {
  enabled?: boolean;
}

export function usePublicCollections(
  options: UsePublicCollectionsOptions = {}
) {
  return useQuery({
    queryKey: ["collections", "public"],
    queryFn: async () => {
      const response = await apiClient.get<Collection[]>(
        "api/v1/collections/public"
      );
      return response.data;
    },
    enabled: options.enabled,
  });
}
