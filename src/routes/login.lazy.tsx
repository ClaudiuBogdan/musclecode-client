import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { authConfig } from "@/config/auth";
import { createLogger } from "@/lib/logger";
import { useAuthStore } from "@/stores/auth";

const logger = createLogger("LoginPage");

export const Route = createLazyFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { redirect = "/" } = Route.useSearch();

  useEffect(() => {
    logger.debug("Login Flow Started", {
      isAuthenticated,
      authEnabled: authConfig.enabled,
      redirectPath: redirect,
    });

    if (!authConfig.enabled) {
      logger.info("Auth Disabled", { action: "redirect", destination: "/" });
      void navigate({ to: "/" });
      return;
    }

    if (isAuthenticated) {
      logger.info("User Already Authenticated", {
        action: "redirect",
        destination: redirect,
      });
      void navigate({ to: redirect });
      return;
    }

    logger.info("Login Required", { action: "initiate_login" });
    login();
  }, [isAuthenticated, login, navigate, redirect]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}
