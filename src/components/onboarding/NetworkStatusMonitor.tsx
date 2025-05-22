import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useOnboardingStore } from "../../lib/onboarding/store";
import { Alert, AlertDescription } from "../ui/alert";

/**
 * A component that monitors network status and retries failed onboarding
 * operations when the connection is restored.
 */
export function NetworkStatusMonitor() {
  const { error, fetchOnboardingState, onboardingState, clearError } =
    useOnboardingStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Fetch onboarding state if it's not available
  useEffect(() => {
    if (!onboardingState) {
      fetchOnboardingState();
    }
  }, [onboardingState, fetchOnboardingState]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);

      // If there was a previous error, retry when connection is restored
      if (error) {
        toast.success("Connection restored", {
          description: "Retrying previous operation...",
          icon: <Wifi className="h-4 w-4 text-green-500" />,
          duration: 5000,
        });

        // Clear the error and retry fetching the state
        clearError();
        fetchOnboardingState();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);

      toast.error("Network connection lost", {
        description: "Please check your internet connection.",
        icon: <WifiOff className="h-4 w-4" />,
        duration: 10000, // Longer duration for offline notifications
      });
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [error, fetchOnboardingState, clearError]);

  // Show a persistent banner when offline
  if (isOffline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
        <Alert
          variant="destructive"
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <WifiOff className="h-4 w-4 mr-2" />
            <AlertDescription>
              You are currently offline. Some features may not work properly.
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  // Return null when online (no UI)
  return null;
}
