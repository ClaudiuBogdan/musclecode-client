// Define interaction data structure based on console output
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

export type InteractionEvent = QuizEvent | QuestionEvent;

export interface InteractionItem {
  events: InteractionEvent[];
}

export interface InteractionData {
  items: Record<string, InteractionItem>;
  version: string;
} 