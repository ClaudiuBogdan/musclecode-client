import { AuthService } from "./types";
import { KeycloakAuthService } from "./keycloak-auth-service";
import { MockAuthService } from "./mock-auth-service";
import { authConfig } from "@/config/auth";

let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = authConfig.enabled
      ? new KeycloakAuthService()
      : new MockAuthService();
  }
  return authServiceInstance;
}
