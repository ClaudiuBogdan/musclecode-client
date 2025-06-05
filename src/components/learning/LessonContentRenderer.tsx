import { AlertTriangleIcon } from 'lucide-react';
import React from 'react';


// Import the actual renderers
import { FlashcardRenderer } from './content/FlashcardRenderer';
import { QuestionRenderer } from './content/QuestionRenderer';
import { QuizRenderer } from './content/QuizRenderer';
import { QuoteRenderer } from './content/QuoteRenderer';
import { TextRenderer } from './content/TextRenderer';
import TitleRenderer from './TitleRenderer';

import type { LessonContent } from '@/types/lesson';

interface LessonContentRendererProps {
  content: LessonContent[];
  lessonId: string;
}

export const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({
  content,
  lessonId
}) => {
  if (!content || content.length === 0) {
    return null; // Or some placeholder if needed
  }

  return (
    <div className="space-y-6"> {/* Add spacing between content items */}
      {content.map((item, index) => {
        // Use 'any' cast temporarily due to potential type definition mismatches
        const contentItem = item as LessonContent;

        switch (contentItem.type) {
          case 'title':
            // Use TitleRenderer
            return <TitleRenderer key={item.id ?? index} {...contentItem} />;
          case 'text':
            // Use TextRenderer
            return <TextRenderer key={item.id ?? index} {...contentItem} />;
          case 'quote':
            // Use QuoteRenderer
            return <QuoteRenderer key={item.id ?? index} {...contentItem} />;
          case 'flashcard':
            // Use FlashcardRenderer
            return <FlashcardRenderer key={item.id ?? index} {...contentItem} />;
          case 'quiz':
            // Use QuizRenderer with lessonId for interaction tracking
            return <QuizRenderer key={item.id ?? index} {...contentItem} lessonId={lessonId} />;
          case 'question':
            // Pass the entire content item as lessonQuestion and lessonId for interaction tracking
            return <QuestionRenderer
              key={item.id ?? index}
              lessonQuestion={contentItem}
              lessonId={lessonId}
            />;
          default:
            return (
              <div key={item.id ?? index} className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                  <AlertTriangleIcon className="h-5 w-5" />
                  <span className="font-semibold">Unsupported Content Item</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {/* @ts-expect-error - Unexpected lexical declaration in case block.eslintno-case-declarations */}
                  This content type ({contentItem.type}) can&apos;t be displayed currently.
                </p>
              </div>
            );
        }
      })}
    </div>
  );
}; 