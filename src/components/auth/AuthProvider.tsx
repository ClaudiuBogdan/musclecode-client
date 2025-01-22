import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (authConfig.enabled) {
      initialize();
    }
  }, [initialize]);

  if (loading && authConfig.enabled) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
