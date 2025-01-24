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
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => Promise<boolean>;
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
          if (get().loading) {
            console.log("[AuthStore] Already loading");
            return;
          }
          console.log("[AuthStore] Initializing");
          set({ loading: true, error: null });
          const authService = getAuthService();
          const authenticated = await authService.init();

          console.log("[AuthStore] Initialization result:", { authenticated });

          if (authenticated) {
            const user = await authService.getUser();
            const token = await authService.getToken();

            console.log("[AuthStore] Setting authenticated state with:", {
              user,
            });
            set({
              isAuthenticated: true,
              user,
              token,
            });
          } else {
            console.log("[AuthStore] Not authenticated after init");
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
          }
        } catch (error) {
          console.error("[AuthStore] Initialization error:", error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      login: async () => {
        try {
          console.log("[AuthStore] Starting login");
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.login();

          // After login, we need to initialize the state again
          const authenticated = await authService.isAuthenticated();
          console.log("[AuthStore] Login result:", { authenticated });

          if (authenticated) {
            const user = await authService.getUser();
            const token = await authService.getToken();

            console.log(
              "[AuthStore] Setting authenticated state after login:",
              { user }
            );
            set({
              isAuthenticated: true,
              user,
              token,
            });
          }
        } catch (error) {
          console.error("[AuthStore] Login error:", error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          console.log("[AuthStore] Starting logout");
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.logout();

          console.log("[AuthStore] Clearing auth state");
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        } catch (error) {
          console.error("[AuthStore] Logout error:", error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: async () => {
        const authService = getAuthService();
        const isAuthenticated = await authService.isAuthenticated();
        console.log("[AuthStore] Checking auth:", { isAuthenticated });
        return isAuthenticated;
      },

      hasRole: async (role: string) => {
        const authService = getAuthService();
        return authService.hasRole(role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
