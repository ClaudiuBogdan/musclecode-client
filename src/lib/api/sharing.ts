import { z } from "zod";

import { ApiError } from "@/types/api";

// Types for sharing functionality
export const shareUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
    accessLevel: z.enum(["view", "edit", "admin"]),
    status: z.enum(["active", "pending"]),
});

export const shareSettingsSchema = z.object({
    id: z.string(),
    resourceType: z.string(),
    resourceId: z.string(),
    title: z.string(),
    linkSharingEnabled: z.boolean(),
    defaultAccessLevel: z.enum(["view", "edit"]),
    users: z.array(shareUserSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const updateShareSettingsSchema = z.object({
    linkSharingEnabled: z.boolean().optional(),
    defaultAccessLevel: z.enum(["view", "edit"]).optional(),
});

export const updateUserAccessSchema = z.object({
    userId: z.string(),
    accessLevel: z.enum(["view", "edit", "admin"]),
});

export type ShareUser = z.infer<typeof shareUserSchema>;
export type ShareSettings = z.infer<typeof shareSettingsSchema>;
export type UpdateShareSettingsRequest = z.infer<typeof updateShareSettingsSchema>;
export type UpdateUserAccessRequest = z.infer<typeof updateUserAccessSchema>;

// Mock data for demonstration
const mockShareSettings: ShareSettings = {
    id: "share-settings-1",
    resourceType: "modules",
    resourceId: "modules-main",
    title: "Learning Modules",
    linkSharingEnabled: true,
    defaultAccessLevel: "view",
    users: [
        {
            id: "3d965525-3dff-440d-bca8-a468c3b30ead",
            name: "Claudiu C. Bogdan",
            email: "clabog@alum.us.es",
            avatar: "/avatars/claudiu.jpg",
            accessLevel: "admin",
            status: "active",
        },
        {
            id: "2",
            name: "Adrian Dragan",
            email: "adrian.dragan@clujstartups.com",
            accessLevel: "edit",
            status: "active",
        },
        {
            id: "3",
            name: "Claudiu Constantin Bogdan",
            email: "claudiu.bogdan@example.com",
            accessLevel: "view",
            status: "active",
        },
        {
            id: "4",
            name: "Daniel Ferecatu",
            email: "ferecatu.daniel@gmail.com",
            accessLevel: "view",
            status: "active",
        },
        {
            id: "5",
            name: "Dutu Calin",
            email: "dutu.calin@example.com",
            accessLevel: "edit",
            status: "active",
        },
        {
            id: "6",
            name: "MarianVilau",
            email: "m.vilau12@gmail.com",
            accessLevel: "view",
            status: "active",
        },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

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
    resourceType: string,
    resourceId: string
): Promise<ShareSettings> {
    try {
        // Mock API call - in real implementation, this would be:
        // const response = await apiClient.get<ShareSettings>(`/api/v1/sharing/${resourceType}/${resourceId}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Return mock data with updated resource info
        const settings = {
            ...mockShareSettings,
            resourceType,
            resourceId,
            shareLink: `${typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/shared/${resourceType}/${Math.random().toString(36).substring(2, 15)}`,
        };

        return shareSettingsSchema.parse(settings);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function updateShareSettings(
    resourceType: string,
    resourceId: string,
    updates: UpdateShareSettingsRequest
): Promise<ShareSettings> {
    try {
        // Mock API call - in real implementation, this would be:
        // const response = await apiClient.patch<ShareSettings>(`/api/v1/sharing/${resourceType}/${resourceId}`, updates);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Update mock data
        const updatedSettings = {
            ...mockShareSettings,
            ...updates,
            resourceType,
            resourceId,
            updatedAt: new Date().toISOString(),
        };

        return shareSettingsSchema.parse(updatedSettings);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function generateNewShareLink(
    resourceType: string,
    _resourceId: string
): Promise<{ shareLink: string }> {
    try {
        // Mock API call - in real implementation, this would be:
        // const response = await apiClient.post<{shareLink: string}>(`/api/v1/sharing/${resourceType}/${resourceId}/regenerate-link`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const newLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/shared/${resourceType}/${Math.random().toString(36).substring(2, 15)}`;
        
        return { shareLink: newLink };
    } catch (error) {
        return handleApiError(error);
    }
}

export async function updateUserAccess(
    _resourceType: string,
    _resourceId: string,
    userId: string,
    accessLevel: "view" | "edit" | "admin"
): Promise<ShareUser> {
    try {
        // Mock API call - in real implementation, this would be:
        // const response = await apiClient.patch<ShareUser>(`/api/v1/sharing/${resourceType}/${resourceId}/users/${userId}`, { accessLevel });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const user = mockShareSettings.users.find(u => u.id === userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        
        const updatedUser = { ...user, accessLevel };
        return shareUserSchema.parse(updatedUser);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function removeUserAccess(
    _resourceType: string,
    _resourceId: string,
    userId: string
): Promise<void> {
    try {
        // Mock API call - in real implementation, this would be:
        // await apiClient.delete(`/api/v1/sharing/${resourceType}/${resourceId}/users/${userId}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const user = mockShareSettings.users.find(u => u.id === userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        
        // In mock, we just simulate success
        return;
    } catch (error) {
        return handleApiError(error);
    }
} 