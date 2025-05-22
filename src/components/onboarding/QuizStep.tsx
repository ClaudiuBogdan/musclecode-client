import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  WifiOff,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Flame,
  Star,
} from "lucide-react";
import { useState } from "react";

import { useOnboardingStore } from "../../lib/onboarding/store";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

import type { QuizAnswer, StepProps } from "../../lib/onboarding/types";

export function QuizStep({ onBack, onNext }: StepProps) {
  const { saveStep, isLoading, filteredQuizQuestions, error, clearError } =
    useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);

  // Flatten all questions into a single array
  const allQuestions = filteredQuizQuestions.flatMap((group) =>
    group.questions.map((q) => ({ ...q, groupName: group.name }))
  );

  // Calculate total questions
  const totalQuestions = allQuestions.length;

  // Calculate progress
  const progress = {
    answered: Object.keys(answers).length,
    total: totalQuestions,
    percentage: Math.round(
      (Object.keys(answers).length / Math.max(totalQuestions, 1)) * 100
    ),
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    // Don't allow changing answer during feedback
    if (showFeedback) return;

    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));

    // Show feedback
    setShowFeedback(true);

    // Update stats
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (optionIndex === -1) {
      setStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
      setConsecutiveCorrect(0);
      setConsecutiveIncorrect(0);
    } else if (optionIndex === currentQuestion.correctAnswerIndex) {
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setConsecutiveCorrect((prev) => prev + 1);
      setConsecutiveIncorrect(0);

      // Trigger confetti for correct answer
      const confettiIntensity = Math.min(consecutiveCorrect + 1, 3);
      confetti({
        particleCount: 100 * confettiIntensity,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setConsecutiveIncorrect((prev) => prev + 1);
      setConsecutiveCorrect(0);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // If this is the last question, submit the quiz
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const success = await saveStep(quizAnswers, "quiz");
      if (success && onNext) {
        onNext();
      } else {
        setLocalError("Failed to save your quiz results. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setLocalError(
        "An error occurred while saving your quiz results. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    clearError();
    handleSubmit();
  };

  const handleSkipQuiz = async () => {
    setIsSubmitting(true);
    clearError();

    try {
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const success = await saveStep(quizAnswers, "quiz");
      if (success && onNext) {
        onNext();
      }
    } catch (err) {
      console.error("Error skipping quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get feedback message based on consecutive correct/incorrect answers
  const getFeedbackMessage = (isCorrect: boolean, isSkipped: boolean) => {
    if (isSkipped) {
      return {
        title: "No problem! Let's learn together.",
        message: "You'll get it next time!",
        icon: Lightbulb,
      };
    }

    if (isCorrect) {
      if (consecutiveCorrect >= 3) {
        return {
          title: "Incredible! You're on fire! 🔥",
          message:
            "That's " + consecutiveCorrect + " correct answers in a row!",
          icon: Flame,
        };
      } if (consecutiveCorrect === 2) {
        return {
          title: "Fantastic! You're on a roll!",
          message: "Keep up the great work!",
          icon: Trophy,
        };
      } 
        return {
          title: "Great job! That's correct!",
          message: "You're making excellent progress!",
          icon: CheckCircle2,
        };
      
    } 
      if (consecutiveIncorrect >= 3) {
        return {
          title: "Don't worry, learning takes time!",
          message: "Take a moment to review the correct answer carefully.",
          icon: Lightbulb,
        };
      } if (consecutiveIncorrect === 2) {
        return {
          title: "Keep going! You've got this!",
          message: "Learning from mistakes is part of the process.",
          icon: Star,
        };
      } 
        return {
          title: "Not quite, but that's how we learn!",
          message: "Let's see what the correct answer is.",
          icon: Lightbulb,
        };
      
    
  };

  // Error states
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "NETWORK_ERROR" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4" />
                  <span>Network error. Please check your connection.</span>
                </div>
              </div>
            ) : (
              error
            )}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (isLoading || !allQuestions) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No questions available</AlertTitle>
          <AlertDescription>
            There are no quiz questions available for your selected topics.
          </AlertDescription>
        </Alert>
        <Button onClick={() => onNext?.()}>Continue</Button>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const userAnswer = answers[currentQuestion?.id];
  const isCorrect = userAnswer === currentQuestion?.correctAnswerIndex;
  const isSkipped = userAnswer === -1;
  const feedback = getFeedbackMessage(isCorrect, isSkipped);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{stats.correct} correct</span>
            <XCircle className="h-4 w-4 text-red-500 ml-2" />
            <span>{stats.incorrect} incorrect</span>
          </div>
        </div>

        <Progress value={progress.percentage} className="h-2" />
      </div>
      {localError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}
      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border rounded-lg shadow-2xs p-6"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs font-medium">
                {currentQuestion.groupName}
              </Badge>
              <h2 className="text-xl font-semibold">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = userAnswer === index;
                const isCorrectOption =
                  index === currentQuestion.correctAnswerIndex;

                let buttonVariant = "outline";
                let buttonClass =
                  "h-auto min-h-[56px] justify-start text-left px-6 py-4 transition-all relative";

                if (showFeedback) {
                  if (isCorrectOption) {
                    buttonVariant = "outline";
                    buttonClass +=
                      " border-2 border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300";
                  } else if (isSelected && !isCorrectOption) {
                    buttonVariant = "outline";
                    buttonClass +=
                      " border-2 border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300";
                  }
                } else if (isSelected) {
                  buttonVariant = "default";
                  buttonClass += " border-2 border-primary";
                }

                return (
                  <Button
                    key={index}
                    variant={buttonVariant as "outline" | "default"}
                    className={buttonClass}
                    onClick={() =>
                      handleAnswerSelect(currentQuestion.id, index)
                    }
                    disabled={showFeedback}
                  >
                    <div className="flex items-center w-full">
                      <span className="text-lg mr-4 font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-base flex-1">{option}</span>
                      {showFeedback && isCorrectOption && (
                        <div className="absolute right-4 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        </div>
                      )}
                      {showFeedback && isSelected && !isCorrectOption && (
                        <div className="absolute right-4 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}

              <Button
                variant={userAnswer === -1 ? "default" : "outline"}
                className={`h-auto min-h-[56px] justify-start text-left px-6 py-4 relative ${
                  userAnswer === -1 && showFeedback
                    ? "border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, -1)}
                disabled={showFeedback}
              >
                <div className="flex items-center w-full">
                  <span className="text-lg mr-4 font-medium">?</span>
                  <span className="text-base">I don't know</span>
                  {showFeedback && userAnswer === -1 && (
                    <div className="absolute right-4 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                    </div>
                  )}
                </div>
              </Button>
            </div>

            {/* Enhanced Feedback section */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-5 rounded-lg border-2 ${
                  isSkipped
                    ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
                    : isCorrect
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isSkipped
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : isCorrect
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      <feedback.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className={`font-semibold ${
                          isSkipped
                            ? "text-amber-700 dark:text-amber-300"
                            : isCorrect
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {feedback.title}
                      </h3>
                      <p
                        className={`${
                          isSkipped
                            ? "text-amber-600 dark:text-amber-400"
                            : isCorrect
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {feedback.message}
                      </p>
                    </div>
                  </div>

                  {(isSkipped || !isCorrect) && (
                    <div className="mt-3 pt-3 border-t border-dashed border-opacity-30 border-gray-400">
                      <p className="font-medium">
                        The correct answer was:{" "}
                        <span className="font-bold">
                          {
                            currentQuestion.options[
                              currentQuestion.correctAnswerIndex
                            ]
                          }
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mt-4 pt-2">
                    {currentQuestionIndex > 0 && (
                      <Button
                        onClick={handlePrevQuestion}
                        variant="outline"
                        className="flex-1 mr-2"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                    )}
                    <Button
                      onClick={handleNextQuestion}
                      className={`flex-1 ${
                        isCorrect ? "bg-green-600 hover:bg-green-700" : ""
                      }`}
                      variant="default"
                    >
                      {currentQuestionIndex < allQuestions.length - 1 ? (
                        <>
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Finish Quiz"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <Button variant="ghost" onClick={handleSkipQuiz} disabled={isSubmitting}>
        Skip Quiz
      </Button>
    </div>
  );
}
