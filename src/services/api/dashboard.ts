import { apiClient } from "./client";
import type {
  UserStats,
  Activity,
  ProgressData,
  Algorithm,
} from "../../types/dashboard";

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const { data } = await apiClient.get(`/users/${userId}/stats`);
  return data;
}

export async function fetchUserProgress(userId: string): Promise<ProgressData> {
  const { data } = await apiClient.get(`/users/${userId}/progress`);
  return data;
}

export async function fetchUserActivity(userId: string): Promise<Activity[]> {
  const { data } = await apiClient.get(`/users/${userId}/activity`);
  return data;
}

export async function fetchRecommendedAlgorithms(
  userId: string
): Promise<Algorithm[]> {
  const { data } = await apiClient.get(`/users/${userId}/recommended`);
  return data;
}
