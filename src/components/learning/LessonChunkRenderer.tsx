import React from 'react';
import { LessonChunk } from '@/types/lesson';
import { NoteChunk } from './chunks/NoteChunk';
import { QuestionChunk } from './chunks/QuestionChunk';
import { FlashcardChunk } from './chunks/FlashcardChunk';
import { BookTextIcon, HelpCircleIcon, LayersIcon, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonChunkRendererProps {
  chunk: LessonChunk;
}

const chunkTypeDetails = {
  note: { icon: BookTextIcon, title: 'Note', color: 'text-blue-600 dark:text-blue-400' },
  question: { icon: HelpCircleIcon, title: 'Question', color: 'text-purple-600 dark:text-purple-400' },
  flashcard: { icon: LayersIcon, title: 'Flashcard', color: 'text-green-600 dark:text-green-400' },
};

export const LessonChunkRenderer: React.FC<LessonChunkRendererProps> = ({
  chunk,
}) => {
  const details = chunkTypeDetails[chunk.type as keyof typeof chunkTypeDetails] || {
    icon: AlertTriangleIcon,
    title: 'Unknown',
    color: 'text-red-600 dark:text-red-400',
  };
  const IconComponent = details.icon;

  const renderChunkContent = () => {
    switch (chunk.type) {
      case 'note':
        return <NoteChunk content={chunk.content} />;
      case 'question':
        return (
          <QuestionChunk 
            content={chunk.content} 
          />
        );
      case 'flashcard':
        return (
          <FlashcardChunk 
            content={chunk.content} 
          />
        );
      default:
        return (
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
               <AlertTriangleIcon className="h-5 w-5" />
               <span className="font-semibold">Unsupported Content</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              This content type ({chunk.type}) can't be displayed currently.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full mt-6">
       <div className={cn("flex items-center gap-2 mb-4", details.color)}>
          <IconComponent className="h-6 w-6" />
          <h2 className="text-xl font-semibold tracking-tight">{details.title}</h2>
       </div>
      {renderChunkContent()}
    </div>
  );
}; 