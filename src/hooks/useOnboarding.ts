import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  OnboardingState,
  UserGoals,
  QuizResults,
} from "../lib/onboarding/types";
import { useRouter } from "@tanstack/react-router";
import { onboardingApi } from "../lib/onboarding/api";

export const useOnboarding = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: onboardingState, isLoading } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => onboardingApi.getOnboardingState(),
  });

  const { mutate: updateOnboarding } = useMutation({
    mutationFn: (data: Partial<OnboardingState>) =>
      onboardingApi.updateOnboardingState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  const { mutate: saveGoals } = useMutation({
    mutationFn: (goals: UserGoals) => onboardingApi.saveUserGoals(goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  const { mutate: submitQuiz } = useMutation({
    mutationFn: (answers: QuizResults["algorithmKnowledge"]) =>
      onboardingApi.submitQuiz(answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
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
      // When reaching the end, mark onboarding as completed and redirect
      updateOnboarding({ isCompleted: true });
      router.navigate({ to: "/" });
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

  const skipOnboarding = () => {
    updateOnboarding({ isCompleted: true });
    router.navigate({ to: "/" });
  };

  return {
    onboardingState,
    isLoading,
    updateOnboarding,
    saveGoals,
    submitQuiz,
    handleNext,
    handleBack,
    skipOnboarding,
  };
};
