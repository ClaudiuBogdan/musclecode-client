import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingState } from "../lib/onboarding/types";
import { useRouter } from "@tanstack/react-router";
import { mockApi } from "../lib/onboarding/mock-api";

export const useOnboarding = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: onboardingState, isLoading } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => mockApi.getOnboardingState(),
  });

  const { mutate: updateOnboarding } = useMutation({
    mutationFn: (data: Partial<OnboardingState>) =>
      mockApi.updateOnboardingState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  const { mutate: skipOnboarding } = useMutation({
    mutationFn: () => mockApi.completeOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      router.navigate({ to: "/" });
    },
  });

  const handleNext = () => {
    if (!onboardingState) return;

    const steps: OnboardingState["currentStep"][] = [
      "welcome",
      "concepts",
      "goals",
      "quiz",
      "summary",
    ];

    const currentIndex = steps.indexOf(onboardingState.currentStep);
    if (currentIndex < steps.length - 1) {
      updateOnboarding({ currentStep: steps[currentIndex + 1] });
    } else {
      skipOnboarding();
    }
  };

  const handleBack = () => {
    if (!onboardingState) return;

    const steps: OnboardingState["currentStep"][] = [
      "welcome",
      "concepts",
      "goals",
      "quiz",
      "summary",
    ];

    const currentIndex = steps.indexOf(onboardingState.currentStep);
    if (currentIndex > 0) {
      updateOnboarding({ currentStep: steps[currentIndex - 1] });
    }
  };

  return {
    onboardingState,
    isLoading,
    updateOnboarding,
    skipOnboarding,
    handleNext,
    handleBack,
  };
};
