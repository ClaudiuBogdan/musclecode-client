import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchShareSettings,
  updateShareSettings,
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
      queryClient.setQueryData(
        sharingKeys.settings(contentNodeId),
        updatedSettings
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
    mutationFn: ({ userId, accessLevel }: { userId: string; accessLevel: "view" | "edit" | "admin" }) =>
      updateUserAccess(contentNodeId, userId, accessLevel),
    onSuccess: (updatedUser) => {
      // Update the cached settings with the updated user
      queryClient.setQueryData<ShareSettings>(
        sharingKeys.settings(contentNodeId),
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
        contentNodeId,
        userId: updatedUser.id,
        newAccessLevel: updatedUser.accessLevel,
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
      const currentData = queryClient.getQueryData<ShareSettings>(
        sharingKeys.settings(contentNodeId)
      );
      const removedUser = currentData?.users.find(u => u.id === userId);

      // Update the cached settings by removing the user
      queryClient.setQueryData<ShareSettings>(
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