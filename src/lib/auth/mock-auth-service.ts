import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";
import { TokenStorage } from "./token-storage";
import type Keycloak from "keycloak-js";

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
      // Auto-authenticate in development
      this.authenticated = true;
      await TokenStorage.setToken(this.mockToken);
      return true;
    } catch {
      this.authenticated = false;
      return false;
    }
  }

  async login(): Promise<void> {
    this.authenticated = true;
    await TokenStorage.setToken(this.mockToken);
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    TokenStorage.removeToken();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check both mock state and token existence
      const token = await TokenStorage.getToken();
      return this.authenticated && !!token;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string> {
    if (!this.authenticated) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }

    try {
      return (await TokenStorage.getToken()) || ""; 
    } catch {
      // If token is not in storage, store it and return
      await TokenStorage.setToken(this.mockToken);
      return this.mockToken;
    }
  }

  async getUser(): Promise<AuthUser | null> {
    if (!(await this.isAuthenticated())) {
      return null;
    }
    return this.mockUser;
  }

  async hasRole(role: string): Promise<boolean> {
    return this.mockUser.roles.includes(role);
  }

  getKeycloakInstance(): Keycloak | null {
    return null;
  }
}
