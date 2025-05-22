import { ErrorBoundary } from "react-error-boundary";

import { authConfig } from "@/config/auth";
import { useAuthStore } from "@/stores/auth";

import { AppErrorBoundary } from "./AppErrorBoundary";
import { AuthLoading } from "./AuthLoading";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);

  if (loading && authConfig.enabled) {
    return <AuthLoading message="Initializing authentication..." />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={AppErrorBoundary}
      onReset={() => {
        // Reset the error state
        useAuthStore.setState({ error: null });
        // Retry initialization
        if (authConfig.enabled) {
          initialize();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
