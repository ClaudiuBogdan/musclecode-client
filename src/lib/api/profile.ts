import { z } from "zod";

import { getAuthService } from "@/lib/auth/auth-service";
import { createLogger } from "@/lib/logger";
import { ApiError } from "@/types/api";

const logger = createLogger("ProfileApi");

// Keycloak UserInfo type
interface KeycloakUserInfo {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  attributes?: {
    bio?: string[];
    picture?: string[];
    github_id?: string[];
    google_id?: string[];
  };
}

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  avatar: z.string().url("Invalid URL").optional().nullable(),
  connections: z
    .object({
      github: z.boolean().default(false),
      google: z.boolean().default(false),
    })
    .default({ github: false, google: false }),
});

export type Profile = z.infer<typeof profileSchema>;

// Helper function to handle API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof z.ZodError) {
    throw new ApiError("Invalid profile data", 422, error.issues);
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

export async function fetchProfile(): Promise<Profile> {
  try {
    const authService = getAuthService();
    const keycloak = authService.getKeycloakInstance();

    if (!keycloak) {
      throw new ApiError("Keycloak instance not found", 500);
    }

    // Get user info from Keycloak
    const userInfo = (await keycloak.loadUserInfo()) as KeycloakUserInfo;

    logger.debug("User Info Received", {
      hasName: !!userInfo.name,
      hasGivenName: !!userInfo.given_name,
      hasFamilyName: !!userInfo.family_name,
      hasPreferredUsername: !!userInfo.preferred_username,
      hasAvatar: !!(userInfo.attributes?.picture?.[0] || userInfo.picture),
    });

    // Get avatar URL, ensuring it's either a valid URL or null
    const avatarUrl =
      userInfo.attributes?.picture?.[0] || userInfo.picture || null;

    // Extract first and last name from Keycloak user info
    let firstName = userInfo.given_name || "";
    let lastName = userInfo.family_name || "";

    // If given_name and family_name are not available, try to split the full name
    if (!firstName && !lastName && userInfo.name) {
      const nameParts = userInfo.name.trim().split(/\s+/);
      if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = "User"; // Default last name if only one name is provided
      } else {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
    }

    // If still no name, use preferred_username or defaults
    if (!firstName) {
      firstName = userInfo.preferred_username?.split("@")[0] || "Unknown";
    }
    if (!lastName) {
      lastName = "User";
    }

    // Extract profile data from Keycloak user info
    const profile: Profile = {
      firstName,
      lastName,
      email: userInfo.email || "",
      bio: userInfo.attributes?.bio?.[0] || "",
      avatar: avatarUrl,
      connections: {
        github: !!userInfo.attributes?.github_id?.[0],
        google: !!userInfo.attributes?.google_id?.[0],
      },
    };

    logger.debug("Profile Data Transformed", {
      hasEmail: !!profile.email,
      hasBio: !!profile.bio,
      hasAvatar: !!profile.avatar,
      connections: profile.connections,
    });

    try {
      const validatedProfile = profileSchema.parse(profile);
      logger.info("Profile Validation Successful", {
        hasConnections: Object.values(validatedProfile.connections).some(
          Boolean
        ),
      });
      return validatedProfile;
    } catch (validationError) {
      logger.error("Profile Validation Failed", {
        error:
          validationError instanceof Error
            ? validationError.message
            : "Unknown validation error",
        stack:
          validationError instanceof Error ? validationError.stack : undefined,
      });
      throw validationError;
    }
  } catch (error) {
    logger.error("Profile Fetch Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw handleApiError(error);
  }
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  try {
    const authService = getAuthService();
    const keycloak = authService.getKeycloakInstance();

    if (!keycloak) {
      throw new ApiError("Keycloak instance not found", 500);
    }

    // Get access token
    const token = await authService.getToken();

    // Update user profile using the Account REST API
    const response = await fetch(
      `${keycloak.authServerUrl}/realms/${keycloak.realm}/account/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          attributes: {
            bio: data.bio ? [data.bio] : undefined,
            picture: data.avatar ? [data.avatar] : undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Profile Update Failed", {
        status: response.status,
        error: errorData.error_description || "Unknown error",
      });
      throw new ApiError(
        errorData.error_description || "Failed to update profile",
        response.status
      );
    }

    logger.info("Profile Update Successful", {
      updatedFields: Object.keys(data),
    });

    // Return updated profile
    return fetchProfile();
  } catch (error) {
    logger.error("Profile Update Error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw handleApiError(error);
  }
}

export async function connectProvider(
  provider: "github" | "google"
): Promise<Profile> {
  try {
    const authService = getAuthService();
    const keycloak = authService.getKeycloakInstance();

    if (!keycloak) {
      throw new ApiError("Keycloak instance not found", 500);
    }

    logger.info("Provider Connection Started", {
      provider,
    });

    // Initiate social login
    await keycloak.login({
      idpHint: provider,
    });

    // Return updated profile after connection
    return fetchProfile();
  } catch (error) {
    logger.error("Provider Connection Failed", {
      provider,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw handleApiError(error);
  }
}

export async function disconnectProvider(
  provider: "github" | "google"
): Promise<Profile> {
  try {
    const authService = getAuthService();
    const keycloak = authService.getKeycloakInstance();

    if (!keycloak) {
      throw new ApiError("Keycloak instance not found", 500);
    }

    // Get the current user ID
    const userId = keycloak.subject;
    if (!userId) {
      throw new ApiError("User ID not found", 401);
    }

    logger.info("Provider Disconnection Started", {
      provider,
    });

    // Get access token for admin API
    const token = await authService.getToken();

    // Remove social provider from user
    const response = await fetch(
      `${keycloak.authServerUrl}/admin/realms/${keycloak.realm}/users/${userId}/federated-identity/${provider}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      logger.error("Provider Disconnection Failed", {
        provider,
        status: response.status,
      });
      throw new ApiError("Failed to disconnect provider", response.status);
    }

    logger.info("Provider Disconnection Successful", {
      provider,
    });

    // Return updated profile
    return fetchProfile();
  } catch (error) {
    logger.error("Provider Disconnection Error", {
      provider,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw handleApiError(error);
  }
}
