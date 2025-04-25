import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCwIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Markdown } from '@/components/ui/markdown';

// Represents a single flashcard content item
interface FlashcardRendererProps {
  id: string; // Use ID for key if available
  front: string;
  back: string;
}

export const FlashcardRenderer: React.FC<FlashcardRendererProps> = ({ 
  id, 
  front, 
  back 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600); // Match animation duration
  };

  return (
    // Removed outer padding/bg/shadow - handled by LessonContentRenderer spacing/parent
    <div className="flex flex-col items-center" key={id}>
      <div className="w-full max-w-md perspective-1000 mb-6">
        <motion.div
          className="relative w-full h-[300px] preserve-3d cursor-pointer"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          onClick={handleFlip}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Card */}
          <Card 
            className="absolute w-full h-full backface-hidden bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden",
              zIndex: 1
            }}
          >
            <CardContent className="relative flex flex-col items-center justify-center h-full p-6">
              {/* Front Indicator */}
              <div className="absolute top-2 left-3 text-xs text-gray-400 dark:text-gray-500 opacity-75 font-medium">
                Front
              </div>
              <div className="text-center">
                <Markdown content={front} />
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
              zIndex: 0
            }}
          >
            <CardContent className="relative flex flex-col items-center justify-center h-full p-6">
              {/* Back Indicator */}
              <div className="absolute top-2 left-3 text-xs text-gray-400 dark:text-gray-500 opacity-75 font-medium">
                Back
              </div>
              <div className="text-center">
                <Markdown content={back} />
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
  );
}; 