import { apiClient } from "@/lib/api/client";

export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export interface GenerateModuleRequestDto {
  prompt: string;
  difficulty?: DifficultyLevel;
}

export interface Lesson {
  title: string;
  description: string;
  order: number;
}

export interface GenerateModuleResponseDto {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  difficulty?: DifficultyLevel;
  createdAt?: string;
  createdBy?: string;
}

export const learningApi = {
  generateModule: async (
    data: GenerateModuleRequestDto
  ): Promise<GenerateModuleResponseDto> => {
    const response = await apiClient.post<GenerateModuleResponseDto>(
      "/api/v1/learning/create/module",
      data
    );
    return response.data;
  },
};