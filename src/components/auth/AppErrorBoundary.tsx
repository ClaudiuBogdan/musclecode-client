import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useErrorHandler } from "@/contexts/ErrorContext";
import { AuthError, isAuthErrorRequiringLogout } from "@/lib/auth/errors";
import { AppError } from "@/lib/errors/types";
import { useAuthStore } from "@/stores/auth";

interface AppErrorBoundaryProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function AppErrorBoundary({
  error,
  resetErrorBoundary,
}: AppErrorBoundaryProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { handleError, clearError } = useErrorHandler();

  useEffect(() => {
    if (isAuthErrorRequiringLogout(error)) {
      void logout();
    }
    // Handle error on mount
    handleError(error);

    // Cleanup on unmount
    return () => {
      clearError();
    };
  }, [error, logout, handleError, clearError]);

  const handleRetry = () => {
    clearError();
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    clearError();
    resetErrorBoundary();
    void navigate({ to: "/" });
  };

  const getErrorTitle = () => {
    if (AppError.isAppError(error)) {
      switch (error.type) {
        case "auth":
          return "Authentication Error";
        case "api":
          return "API Error";
        case "validation":
          return "Validation Error";
        case "network":
          return "Network Error";
        default:
          return "Application Error";
      }
    }

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
      return "Authentication Error";
    }

    return "Application Error";
  };

  const getErrorMessage = () => {
    if (AppError.isAppError(error)) {
      return error.message;
    }

    if (AuthError.isAuthError(error)) {
      return error.message;
    }

    return "An unexpected error occurred. Please try again later.";
  };

  const isRecoverable = () => {
    if (AppError.isAppError(error)) {
      return error.isRecoverable;
    }
    return !isAuthErrorRequiringLogout(error);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{getErrorMessage()}</p>
          <div className="flex gap-4">
            {isRecoverable() && (
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
            )}
            <Button variant="default" onClick={handleGoHome}>
              Go to Home
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
