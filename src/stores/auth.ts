import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAuthService } from "@/lib/auth/auth-service";
import type { AuthUser } from "@/lib/auth/types";
import posthog from "posthog-js";
import { createLogger } from "@/lib/logger";

const logger = createLogger("AuthStore");

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: Error | null;
  refreshing: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => Promise<boolean>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      refreshing: false,

      initialize: async () => {
        try {
          if (get().loading) {
            logger.verbose("Initialize Skipped", { reason: "Already Loading" });
            return;
          }
          logger.verbose("Auth Initialize Started");
          set({ loading: true, error: null });
          const authService = getAuthService();

          const authenticated = await authService.init();
          logger.verbose("Auth Initialize Progress", { authenticated });

          if (authenticated) {
            const user = await authService.getUser();
            const token = await authService.getToken();

            logger.info("User Authenticated", {
              userId: user?.id,
              hasToken: !!token,
            });

            if (user) {
              posthog.identify(user.id, {
                email: user.username,
              });
            }

            set({
              isAuthenticated: true,
              user,
              token,
            });
          } else {
            logger.info("User Not Authenticated");
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            get().login();
          }
        } catch (error) {
          logger.error("Auth Initialize Failed", error as Error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      login: async () => {
        try {
          logger.info("Login Started");
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.login();

          const authenticated = await authService.isAuthenticated();
          logger.debug("Login Progress", { authenticated });

          if (authenticated) {
            const user = await authService.getUser();
            const token = await authService.getToken();

            logger.info("Login Successful", {
              userId: user?.id,
              hasToken: !!token,
            });

            if (user) {
              posthog.identify(user.id, {
                email: user.username,
              });
            }
            set({
              isAuthenticated: true,
              user,
              token,
            });
          }
        } catch (error) {
          logger.error("Login Failed", error as Error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          logger.info("Logout Started");
          set({ loading: true, error: null });
          const authService = getAuthService();
          await authService.logout();

          logger.info("Logout Successful");
          set({
            isAuthenticated: false,
            loading: false,
            user: null,
            token: null,
          });
        } catch (error) {
          logger.error("Logout Failed", error as Error);
          set({ error: error as Error });
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: async () => {
        const authService = getAuthService();
        const isAuthenticated = await authService.isAuthenticated();
        logger.debug("Auth Check Completed", { isAuthenticated });
        return isAuthenticated;
      },

      hasRole: async (role: string) => {
        const authService = getAuthService();
        const hasRole = await authService.hasRole(role);
        logger.debug("Role Check Completed", { role, hasRole });
        return hasRole;
      },

      refreshToken: async () => {
        try {
          if (get().refreshing) {
            logger.debug("Token Refresh Skipped", {
              reason: "Already Refreshing",
            });
            return;
          }

          logger.info("Token Refresh Started");
          set({ refreshing: true });
          const authService = getAuthService();
          const keycloak = authService.getKeycloakInstance();

          if (keycloak) {
            const refreshed = await keycloak.updateToken(70);
            logger.debug("Token Refresh Progress", { refreshed });

            if (refreshed) {
              const token = await authService.getToken();
              const user = await authService.getUser();
              logger.info("Token Refresh Successful", {
                userId: user?.id,
                hasToken: !!token,
              });
              set({
                token,
                user,
                isAuthenticated: true,
              });
            }
          }
        } catch (error) {
          logger.error("Token Refresh Failed", error as Error);
          await get().login();
        } finally {
          set({ refreshing: false });
        }
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
