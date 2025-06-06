import { apiClient } from "@/lib/api/client";
import { useModelsStore } from "@/stores/models";

import type { InteractionData, InteractionItem, InteractionEvent_Legacy } from "@/types/interactions";
import type { LessonQuestion } from "@/types/lesson";
import type { Permission } from "@/types/permissions";

export interface ContentNode {
  id: string;
  type: ContentType;
  status: ContentStatus;
  body: Record<string, unknown>;
  metadata: Record<string, unknown>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum ContentType {
  MODULE = "MODULE",
  LESSON = "LESSON",
  EXERCISE = "EXERCISE"
}

export enum ContentStatus {
  DRAFT = "DRAFT",
  CREATED = "CREATED"
}

export interface ModuleEntity extends ContentNode {
  type: ContentType.MODULE;
}

export interface LessonEntity extends ContentNode {
  type: ContentType.LESSON;
}

export interface ExerciseEntity extends ContentNode {
  type: ContentType.EXERCISE;
}

export async function fetchModules(): Promise<ModuleEntity[]> {
  const response = await apiClient.get<ModuleEntity[]>("/api/v1/content/modules");
  return response.data;
}

export async function fetchModule(id: string): Promise<{ module: ModuleEntity, permission: Permission, lessons: LessonEntity[] }> {
  const response = await apiClient.get<{ module: ModuleEntity, permission: Permission, lessons: LessonEntity[] }>(`/api/v1/content/modules/${id}`);
  return response.data;
}

export async function fetchLesson(id: string): Promise<{
  data: {
    lesson: LessonEntity,
    permission: Permission,
    interaction: InteractionBody
  }
}> {
  const response = await apiClient.get<{data: {
    lesson: LessonEntity,
    permission: Permission,
    interaction: InteractionBody
  }}>(`/api/v1/content/lessons/${id}`);
  return response.data;
}

export async function fetchExercise(id: string): Promise<ExerciseEntity> {
  const response = await apiClient.get<ExerciseEntity>(`/api/v1/content/exercises/${id}`);
  return response.data;
}

export interface CheckAnswerPayload {
  userAnswer: string;
  lessonQuestion: LessonQuestion;
}

export interface CheckAnswerResponse {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedbackItems: {
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

export async function checkQuestionAnswer(questionId: string, payload: CheckAnswerPayload): Promise<CheckAnswerResponse> {
  // Optional: Use the user model api key
  const model = useModelsStore.getState().getActiveModels()[0];

  const response = await apiClient.post<CheckAnswerResponse>(`/api/v1/content/questions/${questionId}/check`, {
    ...payload,
    model
  });
  return response.data;
}

// New event-based interaction structures
export enum EventType {
  QUIZ_ANSWER = 'quiz_answer',
  QUESTION_SUBMIT = 'question_submit',
}

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

export interface EventDto {
  type: EventType;
  payload: QuizAnswerPayload | QuestionSubmitPayload;
}

export interface InteractionRequestDto {
  nodeId: string;
  event: EventDto;
}

export interface InteractionEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, any>;
  version: '1.0';
}

export interface InteractionBody {
  version: '1.0';
  events: InteractionEvent[];
}

export interface InteractionResponseDto {
  data: {
    interaction: InteractionBody;
  };
}

/**
 * Sends user interaction event to the backend API
 */
export async function sendInteraction(payload: InteractionRequestDto): Promise<InteractionResponseDto> {
  const response = await apiClient.post<InteractionResponseDto>('/api/v1/content/interactions', payload);
  return response.data;
}

// Helper function to convert InteractionBody to InteractionData format for backward compatibility
export function convertInteractionBodyToData(interactionBody: InteractionBody): InteractionData {
  const items: Record<string, InteractionItem> = {};

  for (const event of interactionBody.events) {
    let itemId: string;
    let legacyEvent: InteractionEvent_Legacy;

    if (event.type === 'quiz_answer') {
      itemId = event.payload.quizId;
      legacyEvent = {
        type: 'quiz_answer',
        eventId: event.id,
        payload: {
          selectedOption: event.payload.selectedOption,
          isCorrect: event.payload.isCorrect,
          timestamp: event.payload.timestamp
        },
        timestamp: event.timestamp // Already a string
      };
    } else if (event.type === 'question_submit') {
      itemId = event.payload.questionId;
      legacyEvent = {
        type: 'question_submit',
        eventId: event.id,
        payload: {
          userAnswer: event.payload.userAnswer,
          score: event.payload.score,
          maxScore: event.payload.maxScore,
          isCorrect: event.payload.isCorrect,
          timestamp: event.payload.timestamp,
          feedbackItems: event.payload.feedbackItems
        },
        timestamp: event.timestamp // Already a string
      };
    } else {
      continue; // Skip unknown event types
    }

    if (!items[itemId]) {
      items[itemId] = { events: [] };
    }
    items[itemId].events.push(legacyEvent);
  }

  return {
    items,
    version: interactionBody.version
  };
}