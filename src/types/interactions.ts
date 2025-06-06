// Backend interaction event structure
export interface InteractionEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, any>;
  version: '1.0';
}

// Backend interaction body structure
export interface InteractionBody {
  version: '1.0';
  events: InteractionEvent[];
}

// Frontend event payload types for type safety
export interface QuizAnswerPayload {
  quizId: string;
  selectedOption: number;
  isCorrect: boolean;
  timestamp: string;
}

export interface QuestionSubmitPayload {
  questionId: string;
  userAnswer: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  timestamp: string;
  feedbackItems: {
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

// Legacy types for backward compatibility (if still used elsewhere)
export interface QuizEvent {
  type: 'quiz_answer';
  eventId: string;
  payload: {
    isCorrect: boolean;
    timestamp: string;
    selectedOption: number;
  };
  timestamp: string;
}

export interface QuestionEvent {
  type: 'question_submit';
  eventId: string;
  payload: {
    userAnswer: string;
    score?: number;
    maxScore?: number;
    isCorrect: boolean;
    timestamp: string;
    feedbackItems?: {
      isCorrect: boolean;
      explanation: string;
      points: number;
    }[];
  };
  timestamp: string;
}

export type InteractionEvent_Legacy = QuizEvent | QuestionEvent;

export interface InteractionItem {
  events: InteractionEvent_Legacy[];
}

// This is the main interaction data structure that comes from the backend
export interface InteractionData {
  items: Record<string, InteractionItem>;
  version: string;
}

// Utility functions to work with the new event structure
export function isQuizAnswerEvent(event: InteractionEvent): event is InteractionEvent & { payload: QuizAnswerPayload } {
  return event.type === 'quiz_answer';
}

export function isQuestionSubmitEvent(event: InteractionEvent): event is InteractionEvent & { payload: QuestionSubmitPayload } {
  return event.type === 'question_submit';
}

// Helper to convert backend events to frontend-friendly format
export function parseInteractionEvents(interactionBody: InteractionBody): {
  quizAnswers: Map<string, QuizAnswerPayload[]>;
  questionSubmissions: Map<string, QuestionSubmitPayload[]>;
} {
  const quizAnswers = new Map<string, QuizAnswerPayload[]>();
  const questionSubmissions = new Map<string, QuestionSubmitPayload[]>();

  for (const event of interactionBody.events) {
    if (isQuizAnswerEvent(event)) {
      const quizId = event.payload.quizId;
      if (!quizAnswers.has(quizId)) {
        quizAnswers.set(quizId, []);
      }
      quizAnswers.get(quizId)!.push(event.payload);
    } else if (isQuestionSubmitEvent(event)) {
      const questionId = event.payload.questionId;
      if (!questionSubmissions.has(questionId)) {
        questionSubmissions.set(questionId, []);
      }
      questionSubmissions.get(questionId)!.push(event.payload);
    }
  }

  return { quizAnswers, questionSubmissions };
} 