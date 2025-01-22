import Keycloak from "keycloak-js";
import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";
import { authConfig } from "@/config/auth";

export class KeycloakAuthService implements AuthService {
  private keycloak: Keycloak;

  constructor() {
    this.keycloak = new Keycloak({
      url: authConfig.keycloak.url,
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
  }

  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      });

      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error("Failed to initialize Keycloak:", error);
      throw createAuthError(AuthErrorCode.INIT_FAILED);
    }
  }

  private setupTokenRefresh(): void {
    this.keycloak.onTokenExpired = () => {
      this.keycloak.updateToken(70).catch(() => {
        throw createAuthError(AuthErrorCode.TOKEN_EXPIRED);
      });
    };
  }

  async login(): Promise<void> {
    try {
      await this.keycloak.login();
    } catch {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.keycloak.logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Don't throw on logout error, just log it
    }
  }

  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  getToken(): string {
    const token = this.keycloak.token;
    if (!token) {
      throw createAuthError(AuthErrorCode.INVALID_TOKEN);
    }
    return token;
  }

  getUser(): AuthUser | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      id: this.keycloak.subject ?? "",
      username: this.keycloak.tokenParsed?.preferred_username ?? "",
      roles: this.keycloak.realmAccess?.roles ?? [],
    };
  }

  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
    return this.keycloak.hasRealmRole(role);
  }
}
