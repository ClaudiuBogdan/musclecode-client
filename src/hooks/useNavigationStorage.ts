import { useState, useEffect } from "react";
import useSessionStorage from "./useSessionStorage";

/**
 * Custom hook for storing and retrieving navigation step in session storage
 * @param key A unique identifier for this navigation context
 * @param totalSteps The total number of steps available
 * @param initialStep The initial step to use if no value is found in session storage
 * @returns Functions and data for managing navigation state in session storage
 */
function useNavigationStorage(
  key: string,
  totalSteps: number,
  initialStep: number = 0
) {
  // Create a consistent key format
  const storageKey = `navigation_step_${key.replace(/\s+/g, "_").toLowerCase()}`;

  const [navData, setNavData, removeNavData] = useSessionStorage<{
    currentStep: number;
    lastVisitDate: string;
  }>(storageKey, {
    currentStep: initialStep,
    lastVisitDate: new Date().toISOString(),
  });

  // Local state for UI updates
  const [currentStep, setCurrentStep] = useState<number>(navData.currentStep);

  // Sync local state with session storage
  useEffect(() => {
    setCurrentStep(navData.currentStep);
  }, [navData]);

  /**
   * Navigate to the next step if possible
   * @returns The new current step
   */
  const goToNext = (): number => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Update session storage
      setNavData({
        currentStep: nextStep,
        lastVisitDate: new Date().toISOString(),
      });

      return nextStep;
    }
    return currentStep;
  };

  /**
   * Navigate to the previous step if possible
   * @returns The new current step
   */
  const goToPrevious = (): number => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      // Update session storage
      setNavData({
        currentStep: prevStep,
        lastVisitDate: new Date().toISOString(),
      });

      return prevStep;
    }
    return currentStep;
  };

  /**
   * Navigate to a specific step
   * @param step The step to navigate to
   * @returns The new current step
   */
  const goToStep = (step: number): number => {
    const validStep = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(validStep);

    // Update session storage
    setNavData({
      currentStep: validStep,
      lastVisitDate: new Date().toISOString(),
    });

    return validStep;
  };

  /**
   * Reset the stored navigation data
   */
  const resetNavigation = () => {
    setCurrentStep(initialStep);
    removeNavData();
  };

  return {
    currentStep,
    goToNext,
    goToPrevious,
    goToStep,
    resetNavigation,
  };
}

export default useNavigationStorage;
