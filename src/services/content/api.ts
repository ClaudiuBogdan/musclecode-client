import { apiClient } from "@/lib/api/client";

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
  lessons?: LessonEntity[];
  exercises?: ExerciseEntity[];
}

export interface LessonEntity extends ContentNode {
  type: ContentType.LESSON;
  moduleId: string;
  exercises?: ExerciseEntity[];
}

export interface ExerciseEntity extends ContentNode {
  type: ContentType.EXERCISE;
  moduleId: string;
  lessonId?: string;
}

export async function fetchModules(): Promise<ModuleEntity[]> {
  const response = await apiClient.get<ModuleEntity[]>("/api/v1/content/modules");
  return response.data;
}

export async function fetchModule(id: string): Promise<ModuleEntity> {
  const response = await apiClient.get<ModuleEntity>(`/api/v1/content/modules/${id}`);
  return response.data;
}

export async function fetchLesson(id: string): Promise<LessonEntity> {
  const response = await apiClient.get<LessonEntity>(`/api/v1/content/lessons/${id}`);
  return response.data;
}

export async function fetchExercise(id: string): Promise<ExerciseEntity> {
  const response = await apiClient.get<ExerciseEntity>(`/api/v1/content/exercises/${id}`);
  return response.data;
} 