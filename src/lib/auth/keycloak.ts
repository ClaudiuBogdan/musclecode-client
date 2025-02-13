import Keycloak from "keycloak-js";
import { authConfig } from "@/config/auth";
import { AuthErrorCode, createAuthError } from "./errors";
import { mockUser } from "./mock-user";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "KeycloakService" });

export class KeycloakService {
  private static instance: KeycloakService;
  private keycloak: Keycloak | null = null;
  private mockAuthenticated = false;

  private constructor() {
    if (authConfig.enabled) {
      this.keycloak = new Keycloak({
        url: authConfig.keycloak.url,
        realm: authConfig.keycloak.realm,
        clientId: authConfig.keycloak.clientId,
      });
    }
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  public async init(): Promise<boolean> {
    try {
      if (!authConfig.enabled) {
        // Auto-authenticate with mock user in development
        this.mockAuthenticated = true;
        return true;
      }

      if (!this.keycloak) {
        throw createAuthError(AuthErrorCode.CONFIG_ERROR);
      }

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
      logger.error("Keycloak Initialization Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw createAuthError(AuthErrorCode.INIT_FAILED);
    }
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;

    this.keycloak.onTokenExpired = () => {
      this.keycloak?.updateToken(70).catch(() => {
        throw createAuthError(AuthErrorCode.TOKEN_EXPIRED);
      });
    };
  }

  public getToken(): string {
    if (!authConfig.enabled) {
      return mockUser.token;
    }

    const token = this.keycloak?.token;
    if (!token) {
      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    }
    return token;
  }

  public getUsername(): string {
    if (!authConfig.enabled) {
      return mockUser.username;
    }

    return this.keycloak?.tokenParsed?.preferred_username ?? "";
  }

  public getUserId(): string {
    if (!authConfig.enabled) {
      return mockUser.id;
    }

    return this.keycloak?.subject ?? "";
  }

  public async login(): Promise<void> {
    if (!authConfig.enabled) {
      this.mockAuthenticated = true;
      return;
    }

    try {
      await this.keycloak?.login();
    } catch {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
  }

  public async logout(): Promise<void> {
    if (!authConfig.enabled) {
      this.mockAuthenticated = false;
      return;
    }

    try {
      await this.keycloak?.logout();
    } catch (error) {
      logger.error("Keycloak Logout Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw on logout error, just log it
    }
  }

  public isAuthenticated(): boolean {
    if (!authConfig.enabled) {
      return this.mockAuthenticated;
    }

    return !!this.keycloak?.authenticated;
  }

  public getRoles(): string[] {
    if (!authConfig.enabled) {
      return mockUser.roles;
    }

    return this.keycloak?.realmAccess?.roles ?? [];
  }

  public async hasRole(role: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }

    if (!authConfig.enabled) {
      return mockUser.roles.includes(role);
    }

    return this.keycloak?.hasRealmRole(role) ?? false;
  }

  public getKeycloakInstance(): Keycloak | null {
    return this.keycloak;
  }
}
