import Keycloak from "keycloak-js";
import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";
import { authConfig } from "@/config/auth";
import { TokenStorage } from "./token-storage";
import { env } from "@/config/env";

export class KeycloakAuthService implements AuthService {
  private static instance: KeycloakAuthService | null = null;
  private keycloak: Keycloak;

  private constructor() {
    this.keycloak = new Keycloak({
      url: authConfig.keycloak.url,
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
  }

  public static getInstance(): KeycloakAuthService {
    if (!KeycloakAuthService.instance) {
      KeycloakAuthService.instance = new KeycloakAuthService();
    }
    return KeycloakAuthService.instance;
  }

  async init(): Promise<boolean> {
    try {
      const token = await TokenStorage.getToken();
      const refreshToken = await TokenStorage.getRefreshToken();
      const authenticated = await this.keycloak.init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
        token: token,
        refreshToken: refreshToken,
        enableLogging: env.NODE_ENV === "development",
      });

      if (authenticated) {
        this.setupTokenRefresh();
        // Store both tokens
        if (this.keycloak.token && this.keycloak.refreshToken) {
          await TokenStorage.setToken(
            this.keycloak.token,
            this.keycloak.refreshToken
          );
        }
      }

      return authenticated;
    } catch (error) {
      console.error("Failed to initialize Keycloak:", error);
      throw createAuthError(AuthErrorCode.INIT_FAILED);
    }
  }

  private setupTokenRefresh(): void {
    this.keycloak.onTokenExpired = () => {
      this.keycloak
        .updateToken(70)
        .then(async (refreshed) => {
          if (refreshed) {
            // Store both tokens after refresh
            if (this.keycloak.token && this.keycloak.refreshToken) {
              await TokenStorage.setToken(
                this.keycloak.token,
                this.keycloak.refreshToken
              );
            }
          }
        })
        .catch(() => {
          TokenStorage.removeToken();
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
      TokenStorage.removeToken();
      await this.keycloak.logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Don't throw on logout error, just log it
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check both Keycloak state and token existence
      const token = await TokenStorage.getToken();
      return !!this.keycloak.authenticated && !!token;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string> {
    try {
      const token = await TokenStorage.getToken();

      // If we have a token in storage and it's not expired, return it
      if (token && !this.keycloak.isTokenExpired()) {
        return token;
      }

      // If token is expired or not in storage, try to refresh
      const refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken) {
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed && this.keycloak.token && this.keycloak.refreshToken) {
          await TokenStorage.setToken(
            this.keycloak.token,
            this.keycloak.refreshToken
          );
          return this.keycloak.token;
        }
      }

      // If we have a valid token in Keycloak but not in storage, store and return it
      if (
        this.keycloak.token &&
        this.keycloak.refreshToken &&
        !this.keycloak.isTokenExpired()
      ) {
        await TokenStorage.setToken(
          this.keycloak.token,
          this.keycloak.refreshToken
        );
        return this.keycloak.token;
      }

      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    } catch (error) {
      if (error instanceof Error && error.name === 'AuthError') {
        throw error;
      }
      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    }
  }

  async getUser(): Promise<AuthUser | null> {
    if (!(await this.isAuthenticated())) {
      return null;
    }

    return {
      id: this.keycloak.subject ?? "",
      username: this.keycloak.tokenParsed?.preferred_username ?? "",
      roles: this.keycloak.realmAccess?.roles ?? [],
    };
  }

  async hasRole(role: string): Promise<boolean> {
    return this.keycloak.hasRealmRole(role);
  }

  getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
