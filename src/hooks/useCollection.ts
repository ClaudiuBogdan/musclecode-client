import { useQuery } from "@tanstack/react-query";
import { Collection } from "@/types/collection";
import { apiClient } from "@/lib/api/client";

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
