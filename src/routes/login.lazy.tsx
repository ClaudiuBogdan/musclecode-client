import { useEffect } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";

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
    console.log("[LoginPage] Effect triggered", {
      isAuthenticated,
      authEnabled: authConfig.enabled,
      redirect,
    });

    if (!authConfig.enabled) {
      console.log("[LoginPage] Auth disabled, redirecting to home");
      navigate({ to: "/" });
      return;
    }

    if (isAuthenticated) {
      console.log(
        "[LoginPage] Already authenticated, redirecting to",
        redirect
      );
      navigate({ to: redirect });
      return;
    }

    console.log("[LoginPage] Not authenticated, initiating login");
    login();
  }, [isAuthenticated, login, navigate, redirect]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}
