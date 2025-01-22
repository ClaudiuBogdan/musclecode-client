import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuthStore } from "@/stores/auth";
import { authConfig } from "@/config/auth";
import { AuthLoading } from "./AuthLoading";
import { AuthErrorBoundary } from "./AuthErrorBoundary";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    if (authConfig.enabled) {
      initialize();
    }
  }, [initialize]);

  if (loading && authConfig.enabled) {
    return <AuthLoading message="Initializing authentication..." />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorBoundary}
      onReset={() => {
        // Reset the error state
        useAuthStore.setState({ error: null });
        // Retry initialization
        if (authConfig.enabled) {
          initialize();
        }
      }}
    >
      {error ? (
        <AuthErrorBoundary
          error={error}
          resetErrorBoundary={() => useAuthStore.setState({ error: null })}
        />
      ) : (
        children
      )}
    </ErrorBoundary>
  );
}
