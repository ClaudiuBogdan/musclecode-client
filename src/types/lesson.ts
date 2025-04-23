export type ContentStatus = 'draft' | 'published' | 'archived';

export class LessonEntity {
  id: string;
  moduleId?: string;
  status: ContentStatus;
  body: Record<string, any>;
  metadata: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(node: any & { moduleId?: string }) {
    this.id = node.id;
    this.moduleId = node.moduleId;
    this.status = node.status;
    this.body = node.body as Record<string, any>;
    this.metadata = node.metadata as Record<string, any>;
    this.userId = node.userId!;
    this.createdAt = node.createdAt;
    this.updatedAt = node.updatedAt;
  }
}

export interface LessonBody {
  title: string;
  description: string;
  chunks: LessonChunk[];
}

export interface LessonChunk {
  id: string;
  type: 'note' | 'question' | 'flashcard';
  content: LessonContent[];
}

export type LessonContent = LessonText | LessonQuiz | QuoteContent | LessonQuestion | LessonFlashcard;

export interface BaseLessonContent {
  id: string;
  type: string;
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
  questions: {
    question: string;
    isCorrect: boolean;
    hint?: string;
  }[];
}

export interface LessonQuestion extends BaseLessonContent {
  type: 'question';
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  hint?: string;
}

export interface LessonFlashcard extends BaseLessonContent {
  type: 'flashcard';
  front: string;
  back: string;
} 