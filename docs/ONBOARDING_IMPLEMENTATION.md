# Onboarding Implementation Plan

## Overview
This document outlines the implementation plan for the user onboarding flow in MuscleCode. The onboarding process will introduce users to the platform's core functionalities, collect their learning goals, and provide personalized recommendations based on their algorithm knowledge.

## 1. File Structure

```
src/
├── routes/
│   ├── onboarding/
│   │   └── index.lazy.tsx        # Main onboarding route
├── components/
│   ├── onboarding/
│   │   ├── OnboardingLayout.tsx  # Layout wrapper with progress
│   │   ├── StepIndicator.tsx     # Progress indicator
│   │   ├── SkipButton.tsx        # Common skip functionality
│   │   ├── WelcomeStep.tsx
│   │   ├── ConceptsStep.tsx
│   │   ├── GoalsStep.tsx
│   │   ├── QuizStep.tsx
│   │   └── SummaryStep.tsx
├── hooks/
│   ├── useOnboarding.ts          # Main onboarding state management
│   └── useOnboardingQuiz.ts      # Quiz-specific logic
└── lib/
    └── onboarding/
        ├── types.ts              # Type definitions
        └── content.ts            # Static content (welcome, concepts)
```

## 2. State Management

```typescript
// types.ts
export type OnboardingStep = 
  | 'welcome'
  | 'concepts'
  | 'goals'
  | 'quiz'
  | 'summary';

export interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  goals: UserGoals;
  quizResults: QuizResults;
}

// useOnboarding.ts
export const useOnboarding = () => {
  const queryClient = useQueryClient();
  
  // Get onboarding state
  const { data: onboardingState } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => api.getOnboardingState()
  });

  // Update onboarding state
  const { mutate: updateOnboarding } = useMutation({
    mutationFn: (data: Partial<OnboardingState>) => 
      api.updateOnboardingState(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding'])
    }
  });

  // Skip onboarding
  const { mutate: skipOnboarding } = useMutation({
    mutationFn: () => api.completeOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries(['onboarding'])
    }
  });

  return {
    onboardingState,
    updateOnboarding,
    skipOnboarding
  };
};
```

## 3. Main Component Structure

```typescript
// routes/onboarding/index.lazy.tsx
export default function OnboardingPage() {
  const { onboardingState, updateOnboarding, skipOnboarding } = useOnboarding();
  
  const steps = {
    welcome: WelcomeStep,
    concepts: ConceptsStep,
    goals: GoalsStep,
    quiz: QuizStep,
    summary: SummaryStep
  };

  const CurrentStep = steps[onboardingState.currentStep];

  return (
    <OnboardingLayout 
      currentStep={onboardingState.currentStep}
      onSkip={skipOnboarding}
    >
      <CurrentStep 
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </OnboardingLayout>
  );
}
```

## 4. Implementation Phases

### Phase 1: Core Structure & Navigation
- Set up routes and basic components
- Implement navigation logic
- Add skip functionality
- Create basic layout with progress indicator

### Phase 2: Static Content Steps
- Welcome screen with value proposition
- Concepts explanation with simple visuals
- Basic styling and responsiveness

### Phase 3: Interactive Steps
- Goals collection form
- Quiz implementation
- Backend integration for storing preferences

### Phase 4: Personalization
- Summary view with personalized recommendations
- Integration with algorithm collections
- Daily practice suggestions

## 5. API Endpoints Needed

```typescript
interface OnboardingAPI {
  // Get current onboarding state
  getOnboardingState(): Promise<OnboardingState>;
  
  // Update onboarding progress
  updateOnboardingState(data: Partial<OnboardingState>): Promise<void>;
  
  // Complete/skip onboarding
  completeOnboarding(): Promise<void>;
  
  // Save user goals
  saveUserGoals(goals: UserGoals): Promise<void>;
  
  // Save quiz results
  saveQuizResults(results: QuizResults): Promise<void>;
  
  // Get personalized recommendations
  getRecommendations(): Promise<Recommendations>;
}
```

## 6. Key Features to Implement First

1. **Simple Progress Tracking**
   - Store current step
   - Allow navigation between steps
   - Skip functionality

2. **Essential Content**
   - Welcome message
   - Brief platform overview
   - Basic goals collection
   - Simple algorithm familiarity quiz

3. **Basic Personalization**
   - Store user goals
   - Generate initial recommendations