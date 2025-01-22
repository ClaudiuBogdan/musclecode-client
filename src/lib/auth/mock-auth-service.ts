import { AuthService, AuthUser } from "./types";
import { AuthErrorCode, createAuthError } from "./errors";

export class MockAuthService implements AuthService {
  private authenticated = false;
  private mockUser: AuthUser = {
    id: "mock-user-id",
    username: "mock.user",
    roles: ["user", "admin"],
  };

  async init(): Promise<boolean> {
    // Auto-authenticate in development
    this.authenticated = true;
    return true;
  }

  async login(): Promise<void> {
    this.authenticated = true;
  }

  async logout(): Promise<void> {
    this.authenticated = false;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getToken(): string {
    if (!this.authenticated) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
    return "mock-token";
  }

  getUser(): AuthUser | null {
    if (!this.authenticated) {
      return null;
    }
    return this.mockUser;
  }

  hasRole(role: string): boolean {
    if (!this.authenticated) {
      throw createAuthError(AuthErrorCode.UNAUTHORIZED);
    }
    return this.mockUser.roles.includes(role);
  }
}
