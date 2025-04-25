export type ContentStatus = 'draft' | 'published' | 'archived';

// Forward declare LessonBody if needed for LessonEntity
interface LessonBody {
  title: string;
  description: string;
  chunks: LessonChunk[];
}

export class LessonEntity {
  id: string;
  moduleId?: string;
  status: ContentStatus;
  body: LessonBody; // Use specific type if known
  metadata: Record<string, unknown>; // Use unknown instead of any
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(node: Record<string, unknown> & { moduleId?: string }) { // Use Record<string, unknown> instead of any
    this.id = node.id as string;
    this.moduleId = node.moduleId;
    this.status = node.status as ContentStatus;
    // Add type assertion or validation for body structure
    this.body = node.body as LessonBody; 
    this.metadata = node.metadata as Record<string, unknown>;
    this.userId = node.userId as string;
    this.createdAt = node.createdAt as Date;
    this.updatedAt = node.updatedAt as Date;
  }
}

// Ensure LessonBody interface definition is here if not forward declared
/* Redundant if forward declared above
export interface LessonBody {
  title: string;
  description: string;
  chunks: LessonChunk[];
}
*/

export interface LessonChunk {
  id: string;
  type: 'note' | 'question' | 'flashcard' | 'quiz'; // Add 'quiz' type if it's used
  content: LessonContent[];
}

export type LessonContent = LessonTitle | LessonText | LessonQuiz | QuoteContent | LessonQuestion | LessonFlashcard;

export interface BaseLessonContent {
  id: string;
  type: string;
}

export interface LessonTitle extends BaseLessonContent {
  type: 'title';
  title: string;
  titleType: 'h1' | 'h2';
}

export interface LessonText extends BaseLessonContent {
  type: 'text';
  text: string;
}

export interface QuoteContent extends BaseLessonContent {
  type: 'quote';
  quoteType: 'analogy' | 'note' | 'example' | 'tip' | 'warning' | 'question';
  title: string;
  quote: string;
}


export interface LessonQuiz extends BaseLessonContent {
  type: 'quiz';
  question: string;
  options: {
    option: string;
    isAnswer: boolean;
    hint?: string;
  }[];
}

export interface LessonQuestion extends BaseLessonContent {
  type: 'question';
  question: string;
  correctionCriteria: {
    answer: string;
    points: number;
    explanation: string;
  }[];
}

export interface LessonFlashcard extends BaseLessonContent {
  type: 'flashcard';
  front: string;
  back: string;
} 