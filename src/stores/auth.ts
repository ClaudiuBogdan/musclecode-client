import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAuthService } from "@/lib/auth/auth-service";
import type { AuthUser } from "@/lib/auth/types";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
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
          set({ loading: true, error: null });
          const authService = getAuthService();
          const authenticated = await authService.init();

          if (authenticated) {
            const user = authService.getUser();
            const token = authService.getToken();

            set({
              isAuthenticated: true,
              user,
              token,
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
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.login();
        } catch (error) {
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.logout();
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
        const authService = getAuthService();
        return authService.hasRole(role);
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
