import { apiClient } from "@/lib/api/client";
import { mockUserProgressData, mockDetailedUserData } from "@/lib/mocks/api/users";

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

// User Progress Interfaces
export interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  completed: boolean;
  score: number;
  timeSpent: number; // in minutes
  completedAt?: string;
  totalQuestions: number;
  correctAnswers: number;
  attempts: number;
  strugglingTopics: string[];
  strongTopics: string[];
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  attempts: number;
  submittedAt: string;
  feedback: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface UserProgress {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  overallProgress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  lastActiveAt: string;
  startedAt: string;
  lessons: LessonProgress[];
  streak: number;
  badges: string[];
  status: 'active' | 'completed' | 'inactive' | 'struggling';
  strugglingAreas?: string[];
  strengths?: string[];
  recommendedActions?: string[];
  engagementLevel?: 'high' | 'medium' | 'low';
  learningVelocity?: 'fast' | 'normal' | 'slow';
}

export interface ModuleUsersResponse {
  users: UserProgress[];
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  strugglingUsers: number;
}

export interface UserDetailResponse extends UserProgress {
  // Additional detailed fields for individual user view
  strugglingAreas: string[];
  strengths: string[];
  recommendedActions: string[];
  engagementLevel: 'high' | 'medium' | 'low';
  learningVelocity: 'fast' | 'normal' | 'slow';
}

// Flag to switch between mock and real API calls
const USE_MOCKS = true;

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

  // Users API endpoints
  getModuleUsers: async (moduleId: string): Promise<ModuleUsersResponse> => {
    if (USE_MOCKS) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUserProgressData;
    }
    
    const response = await apiClient.get<ModuleUsersResponse>(
      `/api/v1/learning/modules/${moduleId}/users`
    );
    return response.data;
  },

  getUserDetail: async (moduleId: string, userId: string): Promise<UserDetailResponse> => {
    if (USE_MOCKS) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDetailedUserData;
    }
    
    const response = await apiClient.get<UserDetailResponse>(
      `/api/v1/learning/modules/${moduleId}/users/${userId}`
    );
    return response.data;
  },
};