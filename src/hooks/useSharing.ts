import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchShareSettings,
  updateShareSettings,
  generateNewShareLink,
  updateUserAccess,
  removeUserAccess,
} from "@/lib/api/sharing";
import { createLogger } from "@/lib/logger";

import type {
  ShareSettings,
  UpdateShareSettingsRequest,
} from "@/lib/api/sharing";

const logger = createLogger("useSharing");

// Query keys for caching
export const sharingKeys = {
  all: ["sharing"] as const,
  settings: (resourceType: string, resourceId: string) => 
    [...sharingKeys.all, "settings", resourceType, resourceId] as const,
};

// Hook to fetch share settings
export function useShareSettings(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: sharingKeys.settings(resourceType, resourceId),
    queryFn: () => fetchShareSettings(resourceType, resourceId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
  });
}

// Hook to update share settings
export function useUpdateShareSettings(resourceType: string, resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateShareSettingsRequest) =>
      updateShareSettings(resourceType, resourceId, updates),
    onSuccess: (updatedSettings) => {
      // Update the cache with the new settings
      queryClient.setQueryData(
        sharingKeys.settings(resourceType, resourceId),
        updatedSettings
      );
      
      logger.info("Share settings updated successfully", {
        resourceType,
        resourceId,
        updates: updatedSettings,
      });
    },
    onError: (error) => {
      logger.error("Failed to update share settings", {
        error: error instanceof Error ? error.message : String(error),
        resourceType,
        resourceId,
      });
      toast.error("Failed to update share settings");
    },
  });
}

// Hook to update user access level
export function useUpdateUserAccess(resourceType: string, resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, accessLevel }: { userId: string; accessLevel: "view" | "edit" | "admin" }) =>
      updateUserAccess(resourceType, resourceId, userId, accessLevel),
    onSuccess: (updatedUser) => {
      // Update the cached settings with the updated user
      queryClient.setQueryData<ShareSettings>(
        sharingKeys.settings(resourceType, resourceId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map(user => 
              user.id === updatedUser.id ? updatedUser : user
            ),
            updatedAt: new Date().toISOString(),
          };
        }
      );
      
      toast.success(`${updatedUser.name}'s access updated to ${updatedUser.accessLevel}`);
      
      logger.info("User access updated", {
        resourceType,
        resourceId,
        userId: updatedUser.id,
        newAccessLevel: updatedUser.accessLevel,
      });
    },
    onError: (error) => {
      logger.error("Failed to update user access", {
        error: error instanceof Error ? error.message : String(error),
        resourceType,
        resourceId,
      });
      toast.error("Failed to update user access");
    },
  });
}

// Hook to remove user access
export function useRemoveUserAccess(resourceType: string, resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeUserAccess(resourceType, resourceId, userId),
    onSuccess: (_, userId) => {
      // Get the current data to find the user name for the toast
      const currentData = queryClient.getQueryData<ShareSettings>(
        sharingKeys.settings(resourceType, resourceId)
      );
      const removedUser = currentData?.users.find(u => u.id === userId);
      
      // Update the cached settings by removing the user
      queryClient.setQueryData<ShareSettings>(
        sharingKeys.settings(resourceType, resourceId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.filter(user => user.id !== userId),
            updatedAt: new Date().toISOString(),
          };
        }
      );
      
      toast.success(`${removedUser?.name ?? 'User'} removed from access`);
      
      logger.info("User access removed", {
        resourceType,
        resourceId,
        userId,
        userName: removedUser?.name,
      });
    },
    onError: (error) => {
      logger.error("Failed to remove user access", {
        error: error instanceof Error ? error.message : String(error),
        resourceType,
        resourceId,
      });
      toast.error("Failed to remove user access");
    },
  });
} 