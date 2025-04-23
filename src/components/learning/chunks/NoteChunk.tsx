import React from 'react';
import { LessonContent, LessonText, QuoteContent } from '@/types/lesson';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpenIcon, InfoIcon, LightbulbIcon, MessageCircleWarningIcon, QuoteIcon } from 'lucide-react';
import { Markdown } from '@/components/ui/markdown';

interface NoteChunkProps {
  content: LessonContent[];
}

export const NoteChunk: React.FC<NoteChunkProps> = ({ content }) => {
  const renderContent = (item: LessonContent) => {
    let textContent;
    let quoteContent;
    
    switch (item.type) {
      case 'text':
        textContent = item as LessonText;
        return (
          <div key={item.id} className="mb-6">
            <Markdown content={textContent.text} />
          </div>
        );
      case 'quote':
        quoteContent = item as QuoteContent;
        return (
          <div key={item.id} className="mb-6">
            {renderQuote(quoteContent)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderQuote = (quoteContent: QuoteContent) => {
    const getQuoteIcon = () => {
      switch (quoteContent.quoteType) {
        case 'note':
          return <InfoIcon className="h-6 w-6 text-blue-600" />;
        case 'example':
          return <QuoteIcon className="h-6 w-6 text-blue-600" />;
        case 'tip':
          return <LightbulbIcon className="h-6 w-6 text-amber-500" />;
        case 'warning':
          return <MessageCircleWarningIcon className="h-6 w-6 text-red-600" />;
        case 'analogy':
          return <BookOpenIcon className="h-6 w-6 text-green-600" />;
        case 'question':
          return <QuoteIcon className="h-6 w-6 text-purple-600" />;
        default:
          return <InfoIcon className="h-6 w-6 text-blue-600" />;
      }
    };

    const getBgColor = () => {
      switch (quoteContent.quoteType) {
        case 'note':
          return 'bg-blue-50 dark:bg-blue-950/30';
        case 'example':
          return 'bg-blue-50 dark:bg-blue-950/30';
        case 'tip':
          return 'bg-amber-50 dark:bg-amber-950/30';
        case 'warning':
          return 'bg-red-50 dark:bg-red-950/30';
        case 'analogy':
          return 'bg-green-50 dark:bg-green-950/30';
        case 'question':
          return 'bg-purple-50 dark:bg-purple-950/30';
        default:
          return 'bg-blue-50 dark:bg-blue-950/30';
      }
    };

    return (
      <Card className={`${getBgColor()} border-0 overflow-hidden`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 pt-1">
              {getQuoteIcon()}
            </div>
            <div className="flex-1">
              {quoteContent.title && (
                <h3 className="font-medium text-lg mb-2">{quoteContent.title}</h3>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <Markdown content={quoteContent.quote} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="mb-6">
        {content.map(item => renderContent(item))}
      </div>      
    </div>
  );
}; 