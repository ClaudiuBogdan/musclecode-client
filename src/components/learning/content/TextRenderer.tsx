import React from 'react';

import { Markdown } from '@/components/ui/markdown';

interface TextRendererProps {
  id: string;
  text: string;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ id, text }) => {
  return (
    <div key={id} className="prose dark:prose-invert max-w-none">
      <Markdown content={text} />
    </div>
  );
}; 