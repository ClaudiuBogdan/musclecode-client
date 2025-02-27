import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";

export function createRouteGuard() {
  return async () => {
    if (!authConfig.enabled) {
      return;
    }

    // TODO: This should not be triggered for public routes
    await useAuthStore.getState().initialize();
  };
}
