import { apiClient } from "./client";

export async function saveNotes(algorithmId: string, notes: string) {
  const { data } = await apiClient.put<{ notes: string }>(
    `/api/v1/algorithms/practice/${algorithmId}/notes`,
    { notes }
  );
  return data;
}
