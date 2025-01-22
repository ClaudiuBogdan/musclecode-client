import Keycloak from "keycloak-js";
import { authConfig } from "@/config/auth";
import { AuthErrorCode, createAuthError } from "./errors";

export class KeycloakService {
  private static instance: KeycloakService;
  private keycloak: Keycloak;

  private constructor() {
    this.keycloak = new Keycloak({
      url: authConfig.keycloak.url,
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  public async init(): Promise<boolean> {
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

  public getToken(): string | undefined {
    const token = this.keycloak.token;
    if (!token) {
      throw createAuthError(AuthErrorCode.INVALID_TOKEN);
    }
    return token;
  }

  public getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.preferred_username;
  }

  public async login(): Promise<void> {
    try {
      await this.keycloak.login();
    } catch (error) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.keycloak.logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Don't throw on logout error, just log it
    }
  }

  public isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  public hasRole(role: string): boolean {
    if (!this.isAuthenticated()) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
    return this.keycloak.hasRealmRole(role);
  }

  public getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
