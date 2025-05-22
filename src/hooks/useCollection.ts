import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

import type { Collection } from "@/types/collection";

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: async () => {
      const response = await apiClient.get<Collection>(
        `api/v1/collections/${id}`
      );
      return response.data;
    },
  });
}
