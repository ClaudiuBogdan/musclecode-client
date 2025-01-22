export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
}

export interface AuthService {
  init(): Promise<boolean>;
  login(): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getToken(): string;
  getUser(): AuthUser | null;
  hasRole(role: string): boolean;
}
