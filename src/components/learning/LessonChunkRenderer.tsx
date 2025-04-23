import React from 'react';
import { LessonChunk } from '@/types/lesson';
import { NoteChunk } from './chunks/NoteChunk';
import { QuestionChunk } from './chunks/QuestionChunk';
import { FlashcardChunk } from './chunks/FlashcardChunk';

interface LessonChunkRendererProps {
  chunk: LessonChunk;
}

export const LessonChunkRenderer: React.FC<LessonChunkRendererProps> = ({
  chunk,
}) => {
  const renderChunk = () => {
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
          <div className="p-8 text-center">
            <p>Unsupported chunk type: {chunk.type}</p>
            
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {renderChunk()}
    </div>
  );
}; 