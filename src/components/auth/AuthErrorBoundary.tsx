import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { AuthError, isAuthErrorRequiringLogout } from "@/lib/auth/errors";

interface AuthErrorBoundaryProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function AuthErrorBoundary({
  error,
  resetErrorBoundary,
}: AuthErrorBoundaryProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (isAuthErrorRequiringLogout(error)) {
      logout();
    }
  }, [error, logout]);

  const handleRetry = () => {
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  const getErrorTitle = () => {
    if (AuthError.isAuthError(error)) {
      if (error.code.includes("session") || error.code.includes("token")) {
        return "Session Error";
      }
      if (error.code.includes("permission")) {
        return "Permission Error";
      }
      if (error.code.includes("network")) {
        return "Connection Error";
      }
      if (error.code.includes("server")) {
        return "Server Error";
      }
    }
    return "Authentication Error";
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error.message}</p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={isAuthErrorRequiringLogout(error)}
            >
              Try Again
            </Button>
            <Button variant="default" onClick={handleGoHome}>
              Go to Home
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
