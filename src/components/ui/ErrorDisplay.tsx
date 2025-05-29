import { AlertCircleIcon, ShieldXIcon, WifiOffIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isPermissionError, isAuthenticationError, getPermissionErrorMessage } from "@/lib/utils/errorUtils";

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorDisplay({ 
  error, 
  title = "Error", 
  className = "",
  showRetry = false,
  onRetry 
}: ErrorDisplayProps) {
  // Determine error type and appropriate message
  const isPermission = isPermissionError(error);
  const isAuth = isAuthenticationError(error);
  
  let icon = <AlertCircleIcon className="h-4 w-4" />;
  let errorTitle = title;
  let errorMessage = "An unexpected error occurred. Please try again.";
  const variant: "default" | "destructive" = "destructive";

  if (isPermission) {
    icon = <ShieldXIcon className="h-4 w-4" />;
    errorTitle = "Permission Denied";
    errorMessage = getPermissionErrorMessage();
  } else if (isAuth) {
    icon = <WifiOffIcon className="h-4 w-4" />;
    errorTitle = "Authentication Required";
    errorMessage = "Your session has expired. Please log in again.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Alert variant={variant} className={className}>
      {icon}
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription className="mt-2">
        {errorMessage}
        {showRetry && onRetry && !isPermission && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 