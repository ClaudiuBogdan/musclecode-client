export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
}

export interface AuthService {
  init(): Promise<boolean>;
  login(): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getToken(): Promise<string>;
  getUser(): Promise<AuthUser | null>;
  hasRole(role: string): boolean;
}
