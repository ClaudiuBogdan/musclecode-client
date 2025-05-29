import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchShareSettings,
  updateShareSettings,
  updatePermission,
  removeUserAccess,
} from "@/lib/api/sharing";
import { createLogger } from "@/lib/logger";

import type {
  ShareSettingsWithUsers,
  UpdateShareSettingsRequest,
} from "@/lib/api/sharing";
import type { PermissionLevel } from "@/types/permissions";


const logger = createLogger("useSharing");

// Query keys for caching
export const sharingKeys = {
  all: ["sharing"] as const,
  settings: (contentNodeId: string) =>
    [...sharingKeys.all, "settings", contentNodeId] as const,
};

// Hook to fetch share settings
export function useShareSettings(contentNodeId: string) {
  return useQuery({
    queryKey: sharingKeys.settings(contentNodeId),
    queryFn: () => fetchShareSettings(contentNodeId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
  });
}

// Hook to update share settings
export function useUpdateShareSettings(contentNodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateShareSettingsRequest) =>
      updateShareSettings(contentNodeId, updates),
    onSuccess: (updatedSettings) => {
      // Update the cache with the new settings
      queryClient.setQueryData<ShareSettingsWithUsers>(
        sharingKeys.settings(contentNodeId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            ...updatedSettings,
          };
        }
      );

      logger.info("Share settings updated successfully", {
        contentNodeId,
        updates: updatedSettings,
      });
    },
    onError: (error) => {
      logger.error("Failed to update share settings", {
        error: error instanceof Error ? error.message : String(error),
        contentNodeId,
      });
      toast.error("Failed to update share settings");
    },
  });
}

// Hook to update user access level
export function useUpdateUserAccess(contentNodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ permissionId, permissionLevel }: { permissionId: string; permissionLevel: PermissionLevel }) =>
      updatePermission(permissionId, permissionLevel),
    onSuccess: (updatePermission) => {
      // Update the cached settings with the updated user
      queryClient.setQueryData<ShareSettingsWithUsers>(
        sharingKeys.settings(contentNodeId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            users: oldData.users.map(user => {
              if (user.permissionId === updatePermission.id) {
                return {
                  ...user,
                  permissionLevel: updatePermission.permissionLevel,
                };
              }
              return user;
            }),
            updatedAt: new Date().toISOString(),
          };
        }
      );

      toast.success(`${updatePermission.userId}'s access updated to ${updatePermission.permissionLevel}`);

      logger.info("User access updated", {
        contentNodeId,
        userId: updatePermission.id,
        newPermissionLevel: updatePermission.permissionLevel,
      });
    },
    onError: (error) => {
      logger.error("Failed to update user access", {
        error: error instanceof Error ? error.message : String(error),
        contentNodeId,
      });
      toast.error("Failed to update user access");
    },
  });
}

// Hook to remove user access
export function useRemoveUserAccess(contentNodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeUserAccess(contentNodeId, userId),
    onSuccess: (_, userId) => {
      // Get the current data to find the user name for the toast
      const currentData = queryClient.getQueryData<ShareSettingsWithUsers>(
        sharingKeys.settings(contentNodeId)
      );
      const removedUser = currentData?.users.find(u => u.id === userId);

      // Update the cached settings by removing the user
      queryClient.setQueryData<ShareSettingsWithUsers>(
        sharingKeys.settings(contentNodeId),
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
        contentNodeId,
        userId,
        userName: removedUser?.name,
      });
    },
    onError: (error) => {
      logger.error("Failed to remove user access", {
        error: error instanceof Error ? error.message : String(error),
        contentNodeId,
      });
      toast.error("Failed to remove user access");
    },
  });
} 