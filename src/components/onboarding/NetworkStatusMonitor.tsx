import { useEffect } from "react";
import { useOnboardingStore } from "../../lib/onboarding/store";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";

/**
 * A component that monitors network status and retries failed onboarding
 * operations when the connection is restored.
 */
export function NetworkStatusMonitor() {
  const { error, fetchOnboardingState, onboardingState } = useOnboardingStore();

  // Fetch onboarding state if it's not available
  useEffect(() => {
    if (!onboardingState) {
      fetchOnboardingState();
    }
  }, [onboardingState, fetchOnboardingState]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // If there was a previous error, retry when connection is restored
      if (error) {
        toast.success("Connection restored", {
          description: "Retrying previous operation...",
          icon: <Wifi className="h-4 w-4 text-green-500" />,
        });
        fetchOnboardingState();
      }
    };

    const handleOffline = () => {
      toast.error("Network connection lost", {
        description: "Please check your internet connection.",
        icon: <WifiOff className="h-4 w-4" />,
        duration: 5000,
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
  }, [error, fetchOnboardingState]);

  // This is a purely functional component with no UI
  return null;
}
