import React, { useState } from 'react';
import { LessonContent, LessonQuestion } from '@/types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LightbulbIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestionChunkProps {
  content: LessonContent[];
}

export const QuestionChunk: React.FC<QuestionChunkProps> = ({ 
  content, 
}) => {
  // State hooks for selected option, feedback, and hint visibility
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Find the LessonQuestion item safely
  const questionContent = content.find((item): item is LessonQuestion => item.type === 'question');
  // Fallback UI if questionContent or its options are invalid
  if (!questionContent || !Array.isArray(questionContent.options)) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-center">
        <p>No valid question found.</p>
      </div>
    );
  }

  const isCorrectAnswer = () => {
    if (!selectedOption) return false;
    const selectedOptionData = questionContent.options.find(opt => opt.id === selectedOption);
    return selectedOptionData?.isCorrect || false;
  };

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selection after feedback is shown
    setSelectedOption(optionId);
  };

  const handleCheckAnswer = () => {
    setShowFeedback(true);
    if (isCorrectAnswer()) {
      // Add a small delay before completing to allow animation to be seen
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <Card className="border overflow-hidden">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/30 border-b">
          <CardTitle className="text-xl text-center">{questionContent.question}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {questionContent.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const showCorrect = showFeedback && option.isCorrect;
              const showIncorrect = showFeedback && isSelected && !option.isCorrect;
              
              return (
                <motion.div
                  key={option.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    isSelected && !showFeedback && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                    showCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    showIncorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                    !isSelected && !showFeedback && "hover:border-gray-400"
                  )}
                  onClick={() => handleOptionSelect(option.id)}
                  whileHover={!showFeedback ? { scale: 1.01 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                  animate={
                    showCorrect
                      ? { 
                          scale: [1, 1.03, 1],
                          transition: { duration: 0.5, repeat: 1 } 
                        }
                      : {}
                  }
                >
                  {option.text}
                </motion.div>
              );
            })}
          </div>

          {showFeedback && (
            <motion.div 
              className={cn(
                "mt-6 p-4 rounded-lg text-center font-medium",
                isCorrectAnswer() 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isCorrectAnswer() 
                ? "Correct! Well done." 
                : "Incorrect. Try again or use a hint."}
            </motion.div>
          )}

          {showHint && questionContent.hint && (
            <motion.div
              className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <LightbulbIcon className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="text-amber-800 dark:text-amber-200">
                {questionContent.hint}
              </div>
            </motion.div>
          )}
        </CardContent>
        
      </Card>
    </div>
  );
}; 