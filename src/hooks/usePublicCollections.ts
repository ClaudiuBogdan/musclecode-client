import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

import type { Collection } from "@/types/collection";

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
