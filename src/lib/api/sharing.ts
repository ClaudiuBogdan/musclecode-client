import { z } from "zod";

import { ApiError } from "@/types/api";

import { apiClient } from "./client";

import type { PermissionLevel } from "@/types/permissions";

// Types for sharing functionality
export const shareUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    permissionId: z.string(),
    permissionLevel: z.enum(["VIEW", "INTERACT", "EDIT", "MANAGE", "OWNER"]),
});

export const shareSettingsSchema = z.object({
    contentNodeId: z.string(),
    isPublic: z.boolean(),
    defaultPermission: z.enum(["VIEW", "INTERACT", "EDIT", "MANAGE", "OWNER"]),
});

export const shareSettingsWithUsersSchema = shareSettingsSchema.extend({
    users: z.array(shareUserSchema),
});

export const updateShareSettingsSchema = z.object({
    isPublic: z.boolean().optional(),
    defaultPermission: z.enum(["VIEW", "INTERACT", "EDIT", "MANAGE", "OWNER"]).optional(),
});

export const updateUserAccessSchema = z.object({
    userId: z.string(),
    permissionLevel: z.enum(["view", "edit", "admin"]),
});

export const updateUserAccessResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    permissionLevel: z.enum(["VIEW", "INTERACT", "EDIT", "MANAGE", "OWNER"]),
});

export type ShareSettings = z.infer<typeof shareSettingsSchema>;
export type ShareSettingsWithUsers = z.infer<typeof shareSettingsWithUsersSchema>;
export type UpdateShareSettingsRequest = z.infer<typeof updateShareSettingsSchema>;
export type UpdateUserAccessResponse = z.infer<typeof updateUserAccessResponseSchema>;
export type UpdateUserAccessRequest = z.infer<typeof updateUserAccessSchema>;

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
    if (error instanceof z.ZodError) {
        throw new ApiError("Invalid sharing data", 422, error.issues);
    }
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(
        "An unexpected error occurred",
        500,
        error instanceof Error ? error.message : String(error)
    );
};

// API functions with mock implementation
export async function fetchShareSettings(
    contentNodeId: string
): Promise<ShareSettingsWithUsers> {
    try {
        // Mock API call - in real implementation, this would be:
        const response = await apiClient.get<{ sharing: ShareSettingsWithUsers }>(`/api/v1/permissions/content-node/${contentNodeId}/all`);

        // Return mock data with updated resource info
        const settings = response.data.sharing;

        return settings;
    } catch (error) {
        return handleApiError(error);
    }
}

export async function updateShareSettings(
    contentNodeId: string,
    updates: UpdateShareSettingsRequest
): Promise<ShareSettings> {
    try {
        const response = await apiClient.patch<ShareSettings>(`/api/v1/permissions/content-node/${contentNodeId}/sharing`, updates);

        return response.data;

    } catch (error) {
        return handleApiError(error);
    }
}

export async function updatePermission(
    permissionId: string,
    permissionLevel: PermissionLevel
): Promise<UpdateUserAccessResponse> {
    try {
        const response = await apiClient.put<UpdateUserAccessResponse>(`/api/v1/permissions/${permissionId}`, { permissionLevel });

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export async function removeUserAccess(
    contentNodeId: string,
    userId: string
): Promise<void> {
    try {
        await apiClient.delete(`/api/v1/permissions/revoke`, { data: { contentNodeId, userId } });
    } catch (error) {
        return handleApiError(error);
    }
} 