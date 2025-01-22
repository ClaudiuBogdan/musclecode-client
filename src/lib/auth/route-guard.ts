import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";

interface RouteGuardOptions {
  roles?: string[];
  redirectTo?: string;
}

export function createRouteGuard(options: RouteGuardOptions = {}) {
  const { roles, redirectTo = "/login" } = options;

  return async () => {
    if (!authConfig.enabled) {
      return;
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const user = useAuthStore.getState().user;

    if (!isAuthenticated) {
      throw redirect({
        to: redirectTo,
        search: {
          redirect: window.location.pathname,
        },
      });
    }

    if (roles && roles.length > 0) {
      const hasRequiredRole = roles.some((role) => user?.roles.includes(role));

      if (!hasRequiredRole) {
        throw redirect({
          to: "/unauthorized",
        });
      }
    }
  };
}

export function isPublicRoute(path: string): boolean {
  return authConfig.publicPaths.some((publicPath) => {
    if (publicPath.endsWith("*")) {
      return path.startsWith(publicPath.slice(0, -1));
    }
    return path === publicPath;
  });
}
