import { useState, useEffect } from "react";

import useSessionStorage from "./useSessionStorage";

interface QuizSessionData {
  selectedOptions: string[];
  isCorrect?: boolean;
  lastAttemptDate?: string;
}

/**
 * Custom hook for storing and retrieving quiz question data in session storage
 * @param questionTitle The title of the question to use as the key
 * @returns Functions and data for managing quiz question state in session storage
 */
function useQuizSessionStorage(questionTitle: string) {
  // Create a consistent key format for all quiz questions
  const storageKey = `quiz_question_${questionTitle.replace(/\s+/g, "_").toLowerCase()}`;

  const [quizData, setQuizData, removeQuizData] =
    useSessionStorage<QuizSessionData>(storageKey, { selectedOptions: [] });

  // Local state for UI updates
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    quizData.selectedOptions || []
  );
  const [isCorrect, setIsCorrect] = useState<boolean>(!!quizData.isCorrect);

  // Sync local state with session storage
  useEffect(() => {
    setSelectedOptions(quizData.selectedOptions || []);
    setIsCorrect(!!quizData.isCorrect);
  }, [quizData]);

  /**
   * Save a selected option for the current question
   * @param option The option that was selected
   * @param isCorrect Whether the option is correct
   */
  const saveSelectedOption = (option: string, isCorrectAnswer: boolean) => {
    // Only add the option if it's not already in the array
    if (!selectedOptions.includes(option)) {
      const newSelectedOptions = [...selectedOptions, option];

      // Update local state
      setSelectedOptions(newSelectedOptions);

      if (isCorrectAnswer) {
        setIsCorrect(true);
      }

      // Update session storage
      setQuizData((prevData) => ({
        ...prevData,
        selectedOptions: newSelectedOptions,
        isCorrect: isCorrectAnswer || prevData.isCorrect,
        lastAttemptDate: new Date().toISOString(),
      }));
    }
  };

  /**
   * Reset the stored data for this question
   */
  const resetQuestionData = () => {
    setSelectedOptions([]);
    setIsCorrect(false);
    removeQuizData();
  };

  return {
    selectedOptions,
    isCorrect,
    saveSelectedOption,
    resetQuestionData,
  };
}

export default useQuizSessionStorage;
