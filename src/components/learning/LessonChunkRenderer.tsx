import React from 'react';
import { LessonChunk } from '@/types/lesson';
import { BookTextIcon, HelpCircleIcon, LayersIcon, AlertTriangleIcon, CheckSquareIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonContentRenderer } from './LessonContentRenderer';

interface LessonChunkRendererProps {
  chunk: LessonChunk;
}

const chunkTypeDetails = {
  note: { icon: BookTextIcon, title: 'Note', color: 'text-blue-600 dark:text-blue-400' },
  question: { icon: HelpCircleIcon, title: 'Question', color: 'text-purple-600 dark:text-purple-400' },
  flashcard: { icon: LayersIcon, title: 'Flashcard', color: 'text-green-600 dark:text-green-400' },
  quiz: { icon: CheckSquareIcon, title: 'Quiz', color: 'text-indigo-600 dark:text-indigo-400' },
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

  return (
    <div className="w-full mt-6">
       <div className={cn("flex items-center gap-2 mb-4", details.color)}>
          <IconComponent className="h-6 w-6" />
          <h2 className="text-xl font-semibold tracking-tight">{details.title}</h2>
       </div>
       <LessonContentRenderer content={chunk.content} />
    </div>
  );
}; 