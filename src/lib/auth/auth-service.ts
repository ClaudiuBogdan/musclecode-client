import { env } from "@/config/env";
import { KeycloakAuthService } from "./keycloak-auth-service";
import { MockAuthService } from "./mock-auth-service";
import type { AuthService } from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "AuthService" });
let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    logger.info("Initializing Auth Service");
    const isDev = env.NODE_ENV === "development";
    const useMock = isDev && env.VITE_USE_MOCK_AUTH;

    logger.debug("Auth Service Configuration", {
      environment: isDev ? "development" : "production",
      type: useMock ? "mock" : "keycloak",
    });

    if (useMock) {
      logger.info("Using Mock Auth Service");
      authService = new MockAuthService();
    } else {
      logger.info("Using Keycloak Auth Service");
      authService = KeycloakAuthService.getInstance();
    }
  }
  return authService;
}

// Reset auth service (useful for testing)
export function resetAuthService(): void {
  logger.info("Resetting Auth Service");
  authService = null;
}
