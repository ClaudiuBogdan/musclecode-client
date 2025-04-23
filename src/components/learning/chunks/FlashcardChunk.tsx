import React, { useState } from 'react';
import { LessonContent, LessonFlashcard } from '@/types/lesson';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCwIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Markdown } from '@/components/ui/markdown';

interface FlashcardChunkProps {
  content: LessonContent[];
}

export const FlashcardChunk: React.FC<FlashcardChunkProps> = ({
  content,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const flashcardContent = content.find(item => item.type === 'flashcard') as LessonFlashcard;
  
  if (!flashcardContent) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-center">
        <p>No valid flashcard found.</p>
      </div>
    );
  }

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600); // Match this with the animation duration
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md perspective-1000 mb-6">
          <motion.div
            className="relative w-full h-[300px] preserve-3d cursor-pointer"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
            onClick={handleFlip}
          >
            {/* Front Card */}
            <Card 
              className="absolute w-full h-full backface-hidden bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
              style={{ 
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-center">
                  <Markdown content={flashcardContent.front} />
                </div>
                <div className="absolute bottom-4 right-4 opacity-50">
                  <RotateCwIcon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Back Card */}
            <Card
              className="absolute w-full h-full backface-hidden bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
              style={{ 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-center">
                  <Markdown content={flashcardContent.back} />
                </div>
                <div className="absolute bottom-4 right-4 opacity-50">
                  <RotateCwIcon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Click the card to flip it
        </p>
      </div>
    </div>
  );
}; 