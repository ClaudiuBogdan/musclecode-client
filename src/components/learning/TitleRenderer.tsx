import React from 'react';

import type { LessonTitle } from '@/types/lesson';

// interface TitleRendererProps extends LessonTitle {}

const TitleRenderer: React.FC<LessonTitle> = ({ title, titleType }) => {
  if (titleType === 'h1') {
    return <h1 className="text-3xl font-bold mb-4">{title}</h1>;
  }
  if (titleType === 'h2') {
    return <h2 className="text-2xl font-semibold mb-3">{title}</h2>;
  }
  // Fallback or default rendering if needed
  return <p>Invalid title type</p>; // Or render nothing, or a default heading
};

export default TitleRenderer;
