import React from 'react';
import { LessonContent, LessonText, QuoteContent } from '@/types/lesson';
import { InfoIcon, MessageCircleWarningIcon, QuoteIcon, PencilIcon, ZapIcon } from 'lucide-react';
import { Markdown } from '@/components/ui/markdown';

interface NoteChunkProps {
  content: LessonContent[];
}

// Mapping quote types to titles and icons for the new callout style
const quoteTypeStyles: Record<string, { title: string; icon: React.ElementType; colorClasses: string; iconWrapperClasses: string }> = {
  note: {
    title: 'NOTE',
    icon: PencilIcon,
    colorClasses: 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800/60 text-blue-800 dark:text-blue-200',
    iconWrapperClasses: 'bg-blue-100 dark:bg-blue-900/70 text-blue-600 dark:text-blue-300'
  },
  example: {
    title: 'Example',
    icon: InfoIcon,
    colorClasses: 'bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800/60 text-sky-800 dark:text-sky-200',
    iconWrapperClasses: 'bg-sky-100 dark:bg-sky-900/70 text-sky-600 dark:text-sky-300'
  },
  tip: {
    title: 'Tip',
    icon: ZapIcon,
    colorClasses: 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800/60 text-purple-800 dark:text-purple-200',
    iconWrapperClasses: 'bg-purple-100 dark:bg-purple-900/70 text-purple-600 dark:text-purple-300'
  },
  analogy: {
    title: 'Note',
    icon: PencilIcon,
    colorClasses: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200',
    iconWrapperClasses: 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-600 dark:text-emerald-300'
  },
  warning: {
    title: 'Warning',
    icon: MessageCircleWarningIcon,
    colorClasses: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800/60 text-red-800 dark:text-red-200',
    iconWrapperClasses: 'bg-red-100 dark:bg-red-900/70 text-red-600 dark:text-red-300'
  },
  question: {
    title: 'Question',
    icon: QuoteIcon,
    colorClasses: 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:border-fuchsia-800/60 text-fuchsia-800 dark:text-fuchsia-200',
    iconWrapperClasses: 'bg-fuchsia-100 dark:bg-fuchsia-900/70 text-fuchsia-600 dark:text-fuchsia-300'
  },
  default: {
    title: 'INFO',
    icon: InfoIcon,
    colorClasses: 'bg-gray-50 border-gray-200 dark:bg-gray-950/50 dark:border-gray-800/60 text-gray-800 dark:text-gray-200',
    iconWrapperClasses: 'bg-gray-100 dark:bg-gray-900/70 text-gray-600 dark:text-gray-300'
  }
};

export const NoteChunk: React.FC<NoteChunkProps> = ({ content }) => {
  const renderContent = (item: LessonContent) => {
    let textContent;
    let quoteContent;
    
    switch (item.type) {
      case 'text':
        textContent = item as LessonText;
        return (
          <div key={item.id} className="mb-4 prose dark:prose-invert max-w-none">
            <Markdown content={textContent.text} />
          </div>
        );
      case 'quote':
        quoteContent = item as QuoteContent;
        return (
          <div key={item.id} className="mb-4">
            {renderQuote(quoteContent)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderQuote = (quoteContent: QuoteContent) => {
    const style = quoteTypeStyles[quoteContent.quoteType] || quoteTypeStyles.default;
    const IconComponent = style.icon;

    // Determine title to display - use API title first, then default for type
    const displayTitle = quoteContent.title || style.title;
    
    return (
      <div className={`p-4 rounded-lg border ${style.colorClasses} flex items-start gap-3`}>
         <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.iconWrapperClasses}`}>
            <IconComponent className="h-5 w-5" />
         </div>
         <div className="flex-1">
           <h3 className="font-semibold text-sm tracking-wide uppercase mb-1">{displayTitle}</h3>
           <div className="prose prose-sm dark:prose-invert max-w-none">
             <Markdown content={quoteContent.quote} />
           </div>
         </div>
       </div>
    );
  };

  return (
    <div className="space-y-4"> 
      {content.map(item => renderContent(item))}
    </div>
  );
}; 