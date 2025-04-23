import React from 'react';
import { LessonChunk } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { BookIcon, HelpCircleIcon, LightbulbIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonProgressBarProps {
  chunks: LessonChunk[];
  currentChunkIndex: number;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  chunks,
  currentChunkIndex,
}) => {
  // Calculate progress percentage
  const progress = Math.min(((currentChunkIndex) / chunks.length) * 100, 100);
  
  return (
    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
      {/* Progress bar */}
      <motion.div 
        className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 50, damping: 10 }}
      />
      
      {/* Chunk markers */}
      <div className="absolute inset-0 flex items-center">
        {chunks.map((chunk, index) => {
          const isCompleted = index < currentChunkIndex;
          const isCurrent = index === currentChunkIndex;
          const offsetPercent = (index / (chunks.length - 1)) * 100;
          
          // If this is the first or last chunk, adjust position to avoid clipping
          const adjustedOffset = index === 0 
            ? 0 
            : index === chunks.length - 1
              ? 100
              : offsetPercent;
          
          // Determine marker type based on chunk type
          const getMarkerIcon = () => {
            switch (chunk.type) {
              case 'question':
                return <HelpCircleIcon className="h-4 w-4" />;
              case 'flashcard':
                return <LightbulbIcon className="h-4 w-4" />;
              default:
                return <BookIcon className="h-4 w-4" />;
            }
          };
          
          return (
            <div 
              key={chunk.id} 
              className="absolute transform -translate-x-1/2"
              style={{ left: `${adjustedOffset}%` }}
            >
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-full border-2',
                  isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                  isCurrent ? 'bg-white border-blue-600 text-blue-600' : 
                  'bg-white border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                )}
                style={{ 
                  width: chunk.type === 'note' ? '16px' : '24px',
                  height: chunk.type === 'note' ? '16px' : '24px',
                  top: chunk.type === 'note' ? '-6px' : '-10px',
                  position: 'relative',
                  zIndex: isCurrent ? 10 : 1
                }}
                animate={isCurrent ? { 
                  scale: [1, 1.1, 1],
                  transition: { 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'loop'
                  }
                } : {}}
              >
                {chunk.type !== 'note' && getMarkerIcon()}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 