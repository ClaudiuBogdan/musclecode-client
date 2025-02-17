import Keycloak from "keycloak-js";
import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";
import { authConfig } from "@/config/auth";
import { TokenStorage } from "./token-storage";
import { env } from "@/config/env";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "KeycloakAuthService" });

export class KeycloakAuthService implements AuthService {
  private static instance: KeycloakAuthService | null = null;
  private keycloak: Keycloak;

  private constructor() {
    this.keycloak = new Keycloak({
      url: authConfig.keycloak.url,
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
    logger.verbose("Keycloak Instance Created", {
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
  }

  public static getInstance(): KeycloakAuthService {
    if (!KeycloakAuthService.instance) {
      logger.info("Creating New Keycloak Auth Service Instance");
      KeycloakAuthService.instance = new KeycloakAuthService();
    }
    return KeycloakAuthService.instance;
  }

  async init(): Promise<boolean> {
    try {
      logger.info("Initializing Keycloak");
      const token = await TokenStorage.getToken();
      const refreshToken = await TokenStorage.getRefreshToken();

      logger.verbose("Keycloak Init Configuration", {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        enableLogging: env.NODE_ENV === "development",
      });

      const authenticated = await this.keycloak.init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
        token: token ?? undefined,
        refreshToken: refreshToken ?? undefined,
        enableLogging: env.NODE_ENV === "development",
      });

      if (authenticated) {
        logger.info("Keycloak Authentication Successful");
        this.setupTokenRefresh();
        // Store both tokens
        if (this.keycloak.token && this.keycloak.refreshToken) {
          await TokenStorage.setToken(
            this.keycloak.token,
            this.keycloak.refreshToken
          );
          logger.verbose("Tokens Stored Successfully");
        }
      } else {
        logger.info("Keycloak Authentication Failed");
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
      logger.info("Initiating Keycloak Login");
      await this.keycloak.login();
    } catch (error) {
      logger.error("Keycloak Login Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
  }

  async logout(): Promise<void> {
    try {
      TokenStorage.removeToken();
      await this.keycloak.logout();
    } catch (error) {
      logger.error("Logout Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw on logout error, just log it
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await TokenStorage.getToken();
      const isAuth = !!this.keycloak.authenticated && !!token;
      logger.verbose("Authentication Check", {
        hasToken: !!token,
        isKeycloakAuthenticated: !!this.keycloak.authenticated,
        isAuthenticated: isAuth,
      });
      return isAuth;
    } catch (error) {
      logger.error("Authentication Check Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  async getToken(): Promise<string> {
    try {
      const token = await TokenStorage.getToken();

      logger.verbose("Token Status Check", {
        hasStoredToken: !!token,
        isTokenExpired: this.keycloak.isTokenExpired(),
      });

      // If we have a token in storage and it's not expired, return it
      if (token && !this.keycloak.isTokenExpired()) {
        return token;
      }

      // If token is expired or not in storage, try to refresh
      const refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken) {
        logger.info("Attempting Token Refresh");
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed && this.keycloak.token && this.keycloak.refreshToken) {
          await TokenStorage.setToken(
            this.keycloak.token,
            this.keycloak.refreshToken
          );
          logger.info("Token Refresh Successful");
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
        logger.verbose("Storing Valid Keycloak Tokens");
        return this.keycloak.token;
      }

      logger.error("Token Validation Failed", {
        code: AuthErrorCode.TOKEN_INVALID,
      });
      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    } catch (error) {
      logger.error("Token Operation Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        isAuthError: error instanceof Error && error.name === "AuthError",
      });
      if (error instanceof Error && error.name === "AuthError") {
        throw error;
      }
      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    }
  }

  async getUser(): Promise<AuthUser | null> {
    if (!(await this.isAuthenticated())) {
      logger.verbose("Get User Failed - Not Authenticated");
      return null;
    }

    const user = {
      id: this.keycloak.subject ?? "",
      username: this.keycloak.tokenParsed?.preferred_username ?? "",
      roles: this.keycloak.realmAccess?.roles ?? [],
    };

    logger.verbose("User Info Retrieved", {
      hasId: !!user.id,
      hasUsername: !!user.username,
      rolesCount: user.roles.length,
    });

    return user;
  }

  async hasRole(role: string): Promise<boolean> {
    const hasRole = this.keycloak.hasRealmRole(role);
    logger.verbose("Role Check", {
      role,
      hasRole,
    });
    return hasRole;
  }

  getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
