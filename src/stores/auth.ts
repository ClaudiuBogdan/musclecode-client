import { create } from "zustand";
import { persist } from "zustand/middleware";
import { KeycloakService } from "@/lib/auth/keycloak";

interface User {
  id: string;
  username: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: Error | null;

  // Actions
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      initialize: async () => {
        try {
          set({ loading: true });
          const keycloak = KeycloakService.getInstance();
          const authenticated = await keycloak.init();

          if (authenticated) {
            const token = keycloak.getToken();
            const username = keycloak.getUsername();

            set({
              isAuthenticated: true,
              token,
              user: username
                ? {
                    id: keycloak.getKeycloakInstance().subject ?? "",
                    username,
                    roles:
                      keycloak.getKeycloakInstance().realmAccess?.roles ?? [],
                  }
                : null,
            });
          }
        } catch (error) {
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      login: async () => {
        try {
          set({ loading: true });
          const keycloak = KeycloakService.getInstance();
          await keycloak.login();
        } catch (error) {
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          const keycloak = KeycloakService.getInstance();
          await keycloak.logout();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        } catch (error) {
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: () => {
        return get().isAuthenticated;
      },

      hasRole: (role: string) => {
        const keycloak = KeycloakService.getInstance();
        return keycloak.hasRole(role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
