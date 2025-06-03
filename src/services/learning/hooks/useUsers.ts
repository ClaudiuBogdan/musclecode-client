import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { userKeys } from "@/lib/api/queryKeys";

import { learningApi } from "../api";

import type {
  ModuleUsersResponse,
  UserDetailResponse,
} from "../api";

/**
 * Hook to fetch all users in a learning module with their progress
 */
export function useModuleUsers(moduleId: string) {
  return useQuery<ModuleUsersResponse, Error>({
    queryKey: userKeys.moduleUsers(moduleId),
    queryFn: () => learningApi.getModuleUsers(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch detailed progress for a specific user in a module
 */
export function useUserDetail(moduleId: string, userId: string) {
  return useQuery<UserDetailResponse, Error>({
    queryKey: userKeys.userProgress(moduleId, userId),
    queryFn: () => learningApi.getUserDetail(moduleId, userId),
    enabled: !!moduleId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get user progress summary with computed statistics
 */
export function useUserProgressSummary(moduleId: string) {
  const query = useModuleUsers(moduleId);
  
  const summary = useMemo(() => {
    if (!query.data) return null;
    
    const { users, totalUsers, activeUsers, completedUsers, strugglingUsers } = query.data;
    
    const averageProgress = users.reduce((sum, user) => sum + user.overallProgress, 0) / users.length;
    const averageScore = users.reduce((sum, user) => sum + user.averageScore, 0) / users.length;
    const totalTimeSpent = users.reduce((sum, user) => sum + user.totalTimeSpent, 0);
    
    const progressDistribution = {
      beginner: users.filter(u => u.overallProgress < 25).length,
      intermediate: users.filter(u => u.overallProgress >= 25 && u.overallProgress < 75).length,
      advanced: users.filter(u => u.overallProgress >= 75).length,
    };
    
    const engagementStats = users.reduce((acc, user) => {
      const level = user.engagementLevel ?? 'medium';
      acc[level] = (acc[level] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalUsers,
      activeUsers,
      completedUsers,
      strugglingUsers,
      inactiveUsers: totalUsers - activeUsers - completedUsers,
      averageProgress: Math.round(averageProgress),
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      progressDistribution,
      engagementStats,
      users
    };
  }, [query.data]);
  
  return {
    ...query,
    summary
  };
}

 