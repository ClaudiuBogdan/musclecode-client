import { authConfig } from "@/config/auth";
import { useAuthStore } from "@/stores/auth";

export function createRouteGuard() {
  return async () => {
    if (!authConfig.enabled) {
      return;
    }

    const authStore = useAuthStore.getState();

    // TODO: This should not be triggered for public routes
    if (!authStore.isAuthenticated) {
      await authStore.initialize();
    }
  };
}
