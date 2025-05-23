import { 
  InfoIcon, 
  LightbulbIcon, 
  AlertTriangleIcon, 
  FileTextIcon, 
  HelpCircleIcon, 
  GraduationCapIcon 
} from 'lucide-react';
import React from 'react';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Markdown } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

interface QuoteRendererProps {
  id: string;
  quoteType: keyof typeof quoteStyles;
  title: string;
  quote: string;
}

const quoteStyles = {
  note: {
    icon: FileTextIcon,
    bgColor: 'bg-gray-100 dark:bg-gray-800/50',
    borderColor: 'border-gray-300 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  example: {
    icon: InfoIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  tip: {
    icon: LightbulbIcon,
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  warning: {
    icon: AlertTriangleIcon,
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700/50',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  question: {
    icon: HelpCircleIcon,
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-300 dark:border-purple-700/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  analogy: {
    icon: GraduationCapIcon,
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    borderColor: 'border-teal-300 dark:border-teal-700/50',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
};

export const QuoteRenderer: React.FC<QuoteRendererProps> = ({ 
  id, 
  quoteType, 
  title, 
  quote 
}) => {
  const styles = quoteStyles[quoteType as keyof typeof quoteStyles] ?? quoteStyles.note; // Default to note style
  const IconComponent = styles.icon;

  return (
    <Alert key={id} className={cn("border-l-4", styles.bgColor, styles.borderColor)}>
      <div className="flex items-start gap-3">
        <IconComponent className={cn("h-5 w-5 mt-0.5 shrink-0", styles.iconColor)} />
        <div className="flex-grow">
          {title && <AlertTitle className="font-semibold mb-1">{title}</AlertTitle>}
          <AlertDescription className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown content={quote} />
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}; 