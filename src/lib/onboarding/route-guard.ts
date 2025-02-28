import { redirect } from "@tanstack/react-router";
import { createLogger } from "@/lib/logger";
import { useOnboardingStore } from "./store";

const logger = createLogger("OnboardingGuard");

// Paths that should be accessible without completing onboarding
const excludePaths = ["/onboarding", "/login", "/register", "/auth"];

// Where to redirect users who haven't completed onboarding
const redirectTo = "/onboarding";

export const createOnboardingGuard = () => async (path: string) => {
  // Skip onboarding check for excluded paths
  if (excludePaths.some((excludePath) => path.startsWith(excludePath))) {
    logger.debug("Onboarding Check Skipped", {
      path,
      reason: "Excluded path",
    });
    return;
  }

  try {
    const store = useOnboardingStore.getState();

    // Get current onboarding state from the store
    const { initialized } = store;
    let { onboardingState } = store;

    // If store is not initialized or we don't have onboarding state, fetch it
    if (!initialized || !onboardingState) {
      logger.debug("Fetching onboarding state", {
        initialized,
        hasState: !!onboardingState,
      });
      await store.fetchOnboardingState();
      onboardingState = useOnboardingStore.getState().onboardingState;
    }

    // If we still don't have onboarding state or it's not completed, redirect to onboarding
    if (!onboardingState || !onboardingState.isCompleted) {
      logger.info("Redirecting to Onboarding", {
        path,
        currentStep: onboardingState?.currentStep || "welcome",
        isCompleted: onboardingState?.isCompleted,
      });

      // Use throw redirect to properly handle the redirection
      throw redirect({
        to: redirectTo,
      });
    }

    logger.debug("Onboarding Check Passed", {
      path,
      isCompleted: onboardingState.isCompleted,
    });
  } catch (error) {
    const isRedirect = (error as unknown as { isRedirect: boolean }).isRedirect;
    if (isRedirect) {
      throw error;
    }

    // For other errors (like API failures), log but don't block the user
    logger.error("Onboarding Check Failed", {
      path,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Don't redirect on error to prevent redirect loops if the API is down
    return;
  }
};
