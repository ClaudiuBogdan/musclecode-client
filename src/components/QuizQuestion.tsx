import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import useQuizSessionStorage from "@/hooks/useQuizSessionStorage";

const ENCOURAGEMENTS = [
  "Keep trying! You're getting closer.",
  "Not quite, but you've got this!",
  "Almost there! Give it another shot.",
  "That's not it, but don't give up!",
  "You're making progress! Try again!",
  "Good effort! Try a different option!",
  "You can do this! Keep going!",
  "Not that one, but you're learning!",
  "Every attempt brings you closer to the answer!",
  "That's not right, but you're on the right track!",
];

const getRandomEncouragement = (): string => {
  const randomIndex = Math.floor(Math.random() * ENCOURAGEMENTS.length);
  return ENCOURAGEMENTS[randomIndex];
};

const runConfetti = (origin: { x: number; y: number } = { x: 0.5, y: 0.7 }) => {
  const count = 50;
  const defaults = {
    particleCount: count,
    spread: 55,
    origin,
    ticks: 100,
  };

  confetti({
    ...defaults,
    angle: 60,
  });
  confetti({
    ...defaults,
    angle: 120,
  });
};

interface QuizData {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
}

interface QuizQuestionProps {
  children: React.ReactNode;
}

const QuizQuestion: React.FC<QuizQuestionProps> = React.memo(({ children }) => {
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.7,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const content = React.Children.toArray(children).join("").trim();

  const quizData: QuizData | null = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      console.error("Error parsing quiz data");
      return null;
    }
  }, [content]);

  const { selectedOptions, isCorrect, saveSelectedOption } =
    useQuizSessionStorage(quizData?.question || "unknown-question");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setPointer({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-16 text-muted-foreground dark:text-muted-foreground">
        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
        <div>Generating quiz data...</div>
      </div>
    );
  }

  const handleAnswerClick = (option: string) => {
    if (isCorrect) return;

    const isCorrectAnswer = quizData.answer === option;

    // Save to session storage and update state
    saveSelectedOption(option, isCorrectAnswer);

    if (isCorrectAnswer) {
      setEncouragement(null);
      setShowHint(false);
      runConfetti(pointer);
    } else {
      setEncouragement(getRandomEncouragement());
      setShowHint(true);
    }
  };

  const getButtonClasses = (option: string): string => {
    if (option === quizData.answer && isCorrect) {
      return "bg-green-100 border-green-300 ring-2 ring-green-200 text-green-700 dark:bg-green-900 dark:border-green-500 dark:ring-green-600";
    } else if (selectedOptions.includes(option) && option !== quizData.answer) {
      return "bg-red-100 border-red-300 ring-2 ring-red-200 text-red-700 dark:bg-red-900 dark:border-red-500 dark:ring-red-600";
    } else if (isCorrect) {
      return "opacity-50 cursor-not-allowed";
    }

    return "hover:bg-gray-50 dark:hover:bg-gray-700";
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-4 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200 backdrop-blur-sm"
    >
      <h3 className="text-2xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 dark:from-blue-300 to-teal-400 dark:to-teal-200">
        {quizData.question}
      </h3>

      <div className="grid gap-2 mb-4">
        {quizData.options.map((option, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleAnswerClick(option)}
              disabled={isCorrect}
              // Force the button to have auto height and allow wrapping:
              className={`justify-start flex-wrap w-full !h-auto min-h-12 whitespace-normal transition-all cursor-pointer ${getButtonClasses(option)}`}
              variant={
                selectedOptions.includes(option) ? "secondary" : "outline"
              }
            >
              <span className="mr-2 text-gray-500">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-gray-800 dark:text-gray-100">{option}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {(isCorrect || encouragement) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2 flex items-center gap-2 text-base font-semibold"
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">
                Great job!
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">
                {encouragement}
              </span>
            </>
          )}
        </motion.div>
      )}

      {!isCorrect && showHint && quizData.hint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2"
        >
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
            <span className="font-bold">Hint:</span> {quizData.hint}
          </div>
        </motion.div>
      )}

      {isCorrect && quizData.explanation && (
        <motion.div
          key="explanation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2"
        >
          <div className="p-3 border-l-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
            <span className="font-bold">Explanation:</span>{" "}
            {quizData.explanation}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

export default QuizQuestion;
