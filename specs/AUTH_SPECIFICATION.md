# Authentication & Authorization Specification

## Overview

This document outlines the authentication and authorization implementation for the algorithm training application, focusing on security, scalability, and user experience.

## Authentication System

### Technology Stack

- **Token Type**: JWT (JSON Web Tokens)
- **Token Storage**: HttpOnly Cookies
- **Refresh Token**: Secure HTTP-only cookie with rotation
- **Session Management**: Server-side session validation

### Authentication Flow

```typescript:src/lib/auth/types.ts
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
}
```

```typescript:src/lib/auth/authStore.ts
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user: AuthUser | null) =>
    set({ user, isAuthenticated: !!user }),

  clearAuth: () =>
    set({ user: null, isAuthenticated: false }),
}));
```

### Token Management

```typescript:src/lib/auth/tokenManager.ts
export class TokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

  static async refreshAccessToken(): Promise<AuthTokens | null> {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error) {
      // Handle token refresh failure
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp! * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

### Authentication Provider

```typescript:src/lib/auth/AuthProvider.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await apiClient.get('/auth/session');
        setUser(session.data.user);
      } catch {
        clearAuth();
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Authorization System

### Role-Based Access Control (RBAC)

```typescript:src/lib/auth/rbac.ts
export enum UserRole {
  USER = 'USER',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN'
}

export enum Permission {
  READ_ALGORITHM = 'READ_ALGORITHM',
  SUBMIT_SOLUTION = 'SUBMIT_SOLUTION',
  ACCESS_PREMIUM_CONTENT = 'ACCESS_PREMIUM_CONTENT',
  MANAGE_USERS = 'MANAGE_USERS'
}

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.READ_ALGORITHM,
    Permission.SUBMIT_SOLUTION
  ],
  [UserRole.PREMIUM]: [
    Permission.READ_ALGORITHM,
    Permission.SUBMIT_SOLUTION,
    Permission.ACCESS_PREMIUM_CONTENT
  ],
  [UserRole.ADMIN]: [
    Permission.READ_ALGORITHM,
    Permission.SUBMIT_SOLUTION,
    Permission.ACCESS_PREMIUM_CONTENT,
    Permission.MANAGE_USERS
  ]
};
```

### Authorization Hooks

```typescript:src/lib/auth/hooks.ts
export function useAuthorization() {
  const user = useAuthStore(state => state.user);

  const hasPermission = useCallback((permission: Permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: UserRole) => {
    if (!user) return false;
    return user.roles.includes(role);
  }, [user]);

  return { hasPermission, hasRole };
}
```

### Protected Route Components

```typescript:src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole
}) => {
  const { hasPermission, hasRole } = useAuthorization();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthorized =
      (!requiredPermission || hasPermission(requiredPermission)) &&
      (!requiredRole || hasRole(requiredRole));

    if (!isAuthorized) {
      navigate('/unauthorized');
    }
  }, [requiredPermission, requiredRole, hasPermission, hasRole]);

  return <>{children}</>;
};
```

## Security Measures

### CSRF Protection

```typescript:src/lib/auth/csrf.ts
export const csrfMiddleware = {
  getCsrfToken: async () => {
    const response = await apiClient.get('/auth/csrf');
    return response.data.token;
  },

  setRequestHeader: (token: string) => {
    apiClient.defaults.headers['X-CSRF-Token'] = token;
  }
};
```

### Request Interceptors

```typescript:src/lib/api/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newTokens = await TokenManager.refreshAccessToken();
      if (newTokens) {
        return apiClient(originalRequest);
      }

      // Redirect to login if refresh fails
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
```

## Session Management

```typescript:src/lib/auth/session.ts
export class SessionManager {
  static async validateSession(): Promise<boolean> {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }

  static async invalidateSession(): Promise<void> {
    await apiClient.post('/auth/logout');
    useAuthStore.getState().clearAuth();
  }

  static startSessionMonitor(): void {
    // Periodically check session validity
    setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        this.invalidateSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}
```

## Implementation Guidelines

1. **Token Storage**

   - Access tokens stored in memory only
   - Refresh tokens in HTTP-only cookies
   - No sensitive data in localStorage/sessionStorage

2. **Security Headers**

   - Implement CSP (Content Security Policy)
   - Use Strict-Transport-Security
   - Enable X-Frame-Options
   - Set X-XSS-Protection

3. **Error Handling**

   - Generic error messages to users
   - Detailed logging server-side
   - Rate limiting on auth endpoints

4. **Password Requirements**
   - Minimum length: 12 characters
   - Require mixture of characters
   - Check against common password lists
   - Implement password history

This specification provides a secure, scalable authentication and authorization system that follows security best practices while maintaining a good user experience.
