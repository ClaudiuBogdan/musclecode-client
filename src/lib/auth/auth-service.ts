import { KeycloakAuthService } from "./keycloak-auth-service";
import { MockAuthService } from "./mock-auth-service";
import type { AuthService } from "./types";

let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    console.log("[AuthService] Initializing new auth service instance");
    const isDev = import.meta.env.DEV;
    const useMock = isDev && import.meta.env.VITE_USE_MOCK_AUTH === "true";

    console.log("[AuthService] Environment:", { isDev, useMock });

    if (useMock) {
      console.log("[AuthService] Using MockAuthService");
      authService = new MockAuthService();
    } else {
      console.log("[AuthService] Using KeycloakAuthService");
      authService = new KeycloakAuthService();
    }
  }
  return authService;
}

// Reset auth service (useful for testing)
export function resetAuthService(): void {
  console.log("[AuthService] Resetting auth service instance");
  authService = null;
}
