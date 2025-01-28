import Keycloak from "keycloak-js";
import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";
import { authConfig } from "@/config/auth";
import { TokenStorage } from "./token-storage";

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
      const authenticated = await this.keycloak.init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
        enableLogging: import.meta.env.DEV,
      });

      if (authenticated) {
        this.setupTokenRefresh();
        // Store the initial token
        const token = this.keycloak.token;
        if (token) {
          await TokenStorage.setToken(token);
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
            const token = this.keycloak.token;
            if (token) {
              await TokenStorage.setToken(token);
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
      // Always get the token from secure storage
      return await TokenStorage.getToken();
    } catch {
      // If token is not in storage but keycloak has it, store it
      const token = this.keycloak.token;
      if (token) {
        await TokenStorage.setToken(token);
        return token;
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
