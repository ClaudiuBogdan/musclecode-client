import { useEffect } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";
import { createLogger } from "@/lib/logger";

const logger = createLogger("LoginPage");

export const Route = createLazyFileRoute("/login")({
  component: LoginPage,
});

interface SearchParams {
  redirect: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { redirect = "/" } = Route.useSearch() as SearchParams;

  useEffect(() => {
    logger.debug("Login Flow Started", {
      isAuthenticated,
      authEnabled: authConfig.enabled,
      redirectPath: redirect,
    });

    if (!authConfig.enabled) {
      logger.info("Auth Disabled", { action: "redirect", destination: "/" });
      navigate({ to: "/" });
      return;
    }

    if (isAuthenticated) {
      logger.info("User Already Authenticated", {
        action: "redirect",
        destination: redirect,
      });
      navigate({ to: redirect });
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
