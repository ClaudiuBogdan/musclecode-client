import { apiClient } from "@/lib/api/client";
import { useModelsStore } from "@/stores/models";

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
    interactions: InteractionDataDto[]
  }
}> {
  const response = await apiClient.get<{data: {
    lesson: LessonEntity,
    permission: Permission,
    interactions: InteractionDataDto[]
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

// Interaction tracking types and API
export interface InteractionDataDto {
  id: string; // UUID, generated client-side for the interaction
  type: string; // Describes the type of interaction
  data: Record<string, any>; // Flexible object for interaction-specific data
}

export interface InteractionRequestDto {
  nodeId: string; // UUID of the content node (lesson, quiz, etc.)
  interaction: InteractionDataDto;
}

/**
 * Sends user interaction data to the backend API
 * This function is designed to be called asynchronously without blocking the UI
 */
export async function sendInteraction(payload: InteractionRequestDto): Promise<void> {
  const response = await apiClient.post<void>('/api/v1/content/interactions', payload);
  return response.data;
}