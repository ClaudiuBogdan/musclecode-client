import { motion, AnimatePresence } from 'framer-motion';
import { LightbulbIcon, CheckIcon, XIcon, SparklesIcon } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useInteractionTracker } from '@/lib/utils/interactions';

import type { InteractionData } from '@/types/interactions';

// Represents one item in the options array
interface QuizOptionItem {
  option: string;
  isAnswer: boolean;
  hint?: string;
}

interface QuizRendererProps {
  id: string;
  type: 'quiz';
  question: string; // The main question/title for the quiz block
  options: QuizOptionItem[]; // The array of sub-questions/statements
  onComplete?: () => void; // Optional: Callback when correct answer is selected
  lessonId: string; // Lesson ID for interaction tracking
  interactionData?: InteractionData; // Previous interaction data to set initial state
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  id,
  question, // Main question/title
  options,  // Array of sub-questions
  onComplete,
  lessonId,
  interactionData
}) => {
  // Initialize state based on interaction data
  const getInitialState = () => {
    if (!interactionData?.items?.[id]) {
      return {
        hasSubmitted: false,
        isCorrectAnswerSelected: false,
        selectedIndices: new Set<number>(),
        lastSelectedHint: undefined,
        attemptCount: 0
      };
    }

    const quizData = interactionData.items[id];
    const events = quizData.events;
    const selectedIndices = new Set<number>();
    let hasSubmitted = false;
    let isCorrectAnswerSelected = false;
    let lastSelectedHint: string | undefined;
    let attemptCount = 0;

    events.forEach(event => {
      if (event.type === 'quiz_answer') {
        const selectedOption = Number(event.payload.selectedOption);
        selectedIndices.add(selectedOption);
        hasSubmitted = true;
        attemptCount++;
        
        if (event.payload.isCorrect) {
          isCorrectAnswerSelected = true;
        } else {
          // Set hint for incorrect answer
          const option = options[selectedOption];
          if (option?.hint) {
            lastSelectedHint = option.hint;
          }
        }
      }
    });

    return {
      hasSubmitted,
      isCorrectAnswerSelected,
      selectedIndices,
      lastSelectedHint,
      attemptCount
    };
  };

  const initialState = getInitialState();
  const [hasSubmitted, setHasSubmitted] = useState(initialState.hasSubmitted);
  const [isCorrectAnswerSelected, setIsCorrectAnswerSelected] = useState(initialState.isCorrectAnswerSelected);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(initialState.selectedIndices);
  const [lastSelectedHint, setLastSelectedHint] = useState<string | undefined>(initialState.lastSelectedHint);
  const [attemptCount, setAttemptCount] = useState(initialState.attemptCount);

  // Hook for tracking interactions
  const { trackQuiz } = useInteractionTracker(lessonId as string);

  // Renamed from hintContent - Stores the explanation/hint for the CORRECT answer
  const correctAnswerHint = useMemo(() => {
    const typedOptions = options as QuizOptionItem[];
    const correctOption = typedOptions.find(opt => opt.isAnswer);
    return correctOption?.hint;
  }, [options]);

  if (!Array.isArray(options) || options.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-center">
        <p>No quiz options found.</p>
      </div>
    );
  }

  const handleOptionSelect = (index: number) => {
    // Don't allow selection if the correct answer has already been selected
    if (isCorrectAnswerSelected) return;

    const typedOptions = options as QuizOptionItem[];
    const currentSelectionCorrect = typedOptions[index].isAnswer;
    const selectedOption = typedOptions[index];
    const newAttemptCount = attemptCount + 1;

    setSelectedIndices(prev => new Set(prev).add(index)); // Add current index to the set of all selected indices
    setAttemptCount(newAttemptCount);

    // Track the interaction
    void trackQuiz(lessonId as string, id as string, index, currentSelectionCorrect);

    // Store hint if incorrect, clear if correct
    setLastSelectedHint(currentSelectionCorrect ? undefined : selectedOption.hint);

    // Process first submission
    if (!hasSubmitted) {
      setHasSubmitted(true);
      // Call onComplete only if the first attempt is correct
      if (currentSelectionCorrect && onComplete) {
        onComplete();
      }
    }

    // Lock if the current selection is the correct answer
    if (currentSelectionCorrect) {
      setIsCorrectAnswerSelected(true);
    }
  };

  // Helper to get option letter (A, B, C...)
  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    // Render the main question as a title before mapping options
    <div className="space-y-4" key={id}>
      <h3 className="text-xl font-semibold mb-6 text-center">{question}</h3>

      {/* Options List */}
      <Card className="border overflow-hidden shadow-sm">
        <CardContent className="p-4 space-y-3"> {/* Padding and spacing for options */}
          {(options as QuizOptionItem[]).map((opt, index) => {
            const isSelected = selectedIndices.has(index); // Check if this option was ever selected

            // Feedback logic: Show green if this option is correct and has been selected
            const showCorrectFeedback = isSelected && opt.isAnswer;
            // Feedback logic: Show red if this option is incorrect, has been selected, and first attempt made
            const showIncorrectFeedback = isSelected && !opt.isAnswer && hasSubmitted;

            return (
              <motion.div
                key={index} // Use index as key since no stable ID in options
                className={cn(
                  "flex items-center p-3 border rounded-lg transition-all duration-200 ease-in-out",
                  !isCorrectAnswerSelected && "cursor-pointer hover:border-blue-400 dark:hover:border-blue-600", // Hover effect only if not locked
                  showCorrectFeedback && "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-300 dark:ring-green-700", // Correct answer style (feedback)
                  showIncorrectFeedback && "border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-300 dark:ring-red-700", // Incorrect selection style (feedback)
                  isCorrectAnswerSelected && "cursor-default", // Disable interaction after correct answer selected
                  // Dim unselected incorrect options only after the correct one is selected
                  isCorrectAnswerSelected && !opt.isAnswer && !isSelected && "opacity-60"
                )}
                onClick={() => handleOptionSelect(index)}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                whileHover={!isCorrectAnswerSelected ? { scale: 1.015, transition: { duration: 0.1 } } : {}}
                whileTap={!isCorrectAnswerSelected ? { scale: 0.99 } : {}}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 aspect-square rounded-md mr-3 text-xs font-semibold border",
                  showCorrectFeedback ? "bg-green-600 text-white border-green-700" : // Correct and selected
                    showIncorrectFeedback ? "bg-red-600 text-white border-red-700" : // Incorrect and selected
                      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" // Default or unselected
                )}>
                  {getOptionLetter(index)}
                </div>
                <span className="flex-grow text-sm font-medium">{opt.option}</span>
                {showCorrectFeedback && <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-500 ml-2 shrink-0" />}
                {showIncorrectFeedback && <XIcon className="h-5 w-5 text-red-600 dark:text-red-500 ml-2 shrink-0" />}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Hint and Explanation Area */}
      <AnimatePresence>
        {/* Explanation: Show only when the correct answer is selected */}
        {(isCorrectAnswerSelected && correctAnswerHint) && (
          <motion.div
            key="explanation" // Unique key
            className="mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/30 shadow-sm">
              <CardHeader className="p-3 border-b border-purple-200 dark:border-purple-800/50">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  <SparklesIcon className="h-4 w-4" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm text-purple-800 dark:text-purple-200">
                {correctAnswerHint}
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Hint: Show hint for the last *incorrect* selection */}
        {(hasSubmitted && !isCorrectAnswerSelected && lastSelectedHint) && (
          <motion.div
            key="hint" // Unique key
            className="mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0 } }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/30 shadow-sm">
              <CardHeader className="p-3 border-b border-amber-200 dark:border-amber-800/50">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  <LightbulbIcon className="h-4 w-4" />
                  Hint
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm text-amber-800 dark:text-amber-200">
                {lastSelectedHint}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}; 