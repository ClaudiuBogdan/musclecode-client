import { createLogger } from "@/lib/logger";

import { AuthErrorCode, createAuthError } from "./errors";
import { TokenStorage } from "./token-storage";

import type { AuthService, AuthUser } from "./types";
import type Keycloak from "keycloak-js";


const logger = createLogger({ context: "MockAuthService" });

export class MockAuthService implements AuthService {
  private authenticated = false;
  private mockUser: AuthUser = {
    id: "mock-user-id",
    username: "mock.user",
    roles: ["user", "admin"],
  };
  private mockToken = "mock-jwt-token.with.signature";

  async init(): Promise<boolean> {
    try {
      logger.info("Initializing Mock Auth Service");
      // Auto-authenticate in development
      this.authenticated = true;
      await TokenStorage.setToken(this.mockToken);
      logger.debug("Mock Authentication Successful", {
        userId: this.mockUser.id,
        roles: this.mockUser.roles,
      });
      return true;
    } catch (error) {
      logger.error("Mock Authentication Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      this.authenticated = false;
      return false;
    }
  }

  async login(): Promise<void> {
    logger.info("Mock Login");
    this.authenticated = true;
    await TokenStorage.setToken(this.mockToken);
    logger.debug("Mock Login Successful", {
      userId: this.mockUser.id,
    });
  }

  async logout(): Promise<void> {
    logger.info("Mock Logout");
    this.authenticated = false;
    TokenStorage.removeToken();
    logger.debug("Mock Logout Successful");
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check both mock state and token existence
      const token = await TokenStorage.getToken();
      const isAuth = this.authenticated && !!token;
      logger.debug("Mock Authentication Check", {
        hasToken: !!token,
        isAuthenticated: isAuth,
      });
      return isAuth;
    } catch (error) {
      logger.error("Mock Authentication Check Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  async getToken(): Promise<string> {
    if (!this.authenticated) {
      logger.error("Token Request Failed - Not Authenticated");
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }

    try {
      const token = await TokenStorage.getToken();
      if (token) {
        logger.debug("Retrieved Existing Mock Token");
        return token;
      }
      // If token is not in storage, store it and return
      logger.debug("Storing New Mock Token");
      await TokenStorage.setToken(this.mockToken);
      return this.mockToken;
    } catch (error) {
      logger.error("Mock Token Operation Failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw createAuthError(AuthErrorCode.TOKEN_INVALID);
    }
  }

  async getUser(): Promise<AuthUser | null> {
    if (!(await this.isAuthenticated())) {
      logger.debug("Get User Failed - Not Authenticated");
      return null;
    }
    logger.debug("Retrieved Mock User", {
      userId: this.mockUser.id,
      rolesCount: this.mockUser.roles.length,
    });
    return this.mockUser;
  }

  async hasRole(role: string): Promise<boolean> {
    const hasRole = this.mockUser.roles.includes(role);
    logger.debug("Mock Role Check", {
      role,
      hasRole,
    });
    return hasRole;
  }

  getKeycloakInstance(): Keycloak | null {
    return null;
  }
}
