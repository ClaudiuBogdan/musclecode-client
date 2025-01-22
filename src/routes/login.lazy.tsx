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
    if (!authConfig.enabled) {
      navigate({ to: "/" });
      return;
    }

    if (isAuthenticated) {
      navigate({ to: redirect });
      return;
    }

    login();
  }, [isAuthenticated, login, navigate, redirect]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-lg">Redirecting to login...</div>
    </div>
  );
}
