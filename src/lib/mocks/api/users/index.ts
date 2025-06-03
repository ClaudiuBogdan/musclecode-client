import type { ModuleUsersResponse, UserDetailResponse, LessonProgress, QuestionAnswer } from "@/services/learning/api";

// Mock lesson progress data
const mockLessonProgress: LessonProgress[] = [
  {
    lessonId: "1",
    lessonTitle: "Introduction to Data Structures",
    completed: true,
    score: 85,
    timeSpent: 45,
    completedAt: "2024-01-15T14:30:00Z",
    totalQuestions: 10,
    correctAnswers: 8,
    attempts: 2,
    strugglingTopics: ["Time Complexity"],
    strongTopics: ["Arrays", "Basic Algorithms"],
  },
  {
    lessonId: "2",
    lessonTitle: "Advanced Algorithms",
    completed: true,
    score: 72,
    timeSpent: 85,
    completedAt: "2024-01-18T16:45:00Z",
    totalQuestions: 15,
    correctAnswers: 11,
    attempts: 3,
    strugglingTopics: ["Dynamic Programming", "Graph Algorithms"],
    strongTopics: ["Sorting", "Basic Recursion"],
  },
  {
    lessonId: "3",
    lessonTitle: "System Design Principles",
    completed: false,
    score: 0,
    timeSpent: 12,
    totalQuestions: 12,
    correctAnswers: 0,
    attempts: 1,
    strugglingTopics: [],
    strongTopics: [],
  },
];

// Mock detailed question answers
const mockQuestionAnswers: QuestionAnswer[] = [
  {
    questionId: "q1",
    questionText: "What is the time complexity of binary search?",
    userAnswer: "O(log n)",
    correctAnswer: "O(log n)",
    isCorrect: true,
    timeSpent: 120,
    attempts: 1,
    submittedAt: "2024-01-15T14:20:00Z",
    feedback: "Correct! Binary search eliminates half the search space in each iteration.",
    difficulty: 'medium',
    topic: "Time Complexity"
  },
  {
    questionId: "q2",
    questionText: "Implement a function to reverse a linked list",
    userAnswer: "function reverse(head) { let prev = null; let curr = head; while(curr) { let next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev; }",
    correctAnswer: "function reverse(head) { let prev = null; let curr = head; while(curr) { let next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev; }",
    isCorrect: true,
    timeSpent: 300,
    attempts: 1,
    submittedAt: "2024-01-15T14:25:00Z",
    feedback: "Excellent implementation! Clean iterative solution with proper pointer management.",
    difficulty: 'medium',
    topic: "Linked Lists"
  },
  {
    questionId: "q10",
    questionText: "Implement a dynamic programming solution for the fibonacci sequence",
    userAnswer: "function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }",
    correctAnswer: "function fib(n) { const dp = [0, 1]; for(let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]; return dp[n]; }",
    isCorrect: false,
    timeSpent: 420,
    attempts: 3,
    submittedAt: "2024-01-18T16:30:00Z",
    feedback: "This is a recursive solution, not dynamic programming. Consider using memoization or bottom-up approach.",
    difficulty: 'hard',
    topic: "Dynamic Programming"
  }
];

// Enhanced lesson progress with answers for detailed view
const mockDetailedLessonProgress: LessonProgress[] = mockLessonProgress.map(lesson => ({
  ...lesson,
  answers: lesson.lessonId === "1" ? mockQuestionAnswers.slice(0, 2) : 
           lesson.lessonId === "2" ? [mockQuestionAnswers[2]] : []
}));

export const mockUserProgressData: ModuleUsersResponse = {
  users: [
    {
      userId: "user-1",
      userName: "Sarah Johnson",
      userEmail: "sarah.johnson@example.com",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9e2f022?w=100&h=100&fit=crop&crop=face",
      overallProgress: 75,
      completedLessons: 8,
      totalLessons: 12,
      totalTimeSpent: 480,
      averageScore: 85,
      lastActiveAt: "2024-01-20T10:30:00Z",
      startedAt: "2024-01-10T09:00:00Z",
      lessons: mockLessonProgress,
      streak: 7,
      badges: ["Fast Learner", "Perfect Score", "Consistent"],
      status: 'active'
    },
    {
      userId: "user-2",
      userName: "Michael Chen",
      userEmail: "michael.chen@example.com",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      overallProgress: 92,
      completedLessons: 11,
      totalLessons: 12,
      totalTimeSpent: 720,
      averageScore: 88,
      lastActiveAt: "2024-01-19T16:45:00Z",
      startedAt: "2024-01-08T14:20:00Z",
      lessons: mockLessonProgress,
      streak: 12,
      badges: ["Top Performer", "Problem Solver", "Dedicated"],
      status: 'active'
    },
    {
      userId: "user-3",
      userName: "Emily Rodriguez",
      userEmail: "emily.rodriguez@example.com",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      overallProgress: 45,
      completedLessons: 5,
      totalLessons: 12,
      totalTimeSpent: 280,
      averageScore: 68,
      lastActiveAt: "2024-01-18T08:15:00Z",
      startedAt: "2024-01-12T11:30:00Z",
      lessons: mockLessonProgress.slice(0, 2),
      streak: 3,
      badges: ["Getting Started"],
      status: 'struggling'
    },
    {
      userId: "user-4",
      userName: "David Kim",
      userEmail: "david.kim@example.com",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      overallProgress: 100,
      completedLessons: 12,
      totalLessons: 12,
      totalTimeSpent: 960,
      averageScore: 94,
      lastActiveAt: "2024-01-17T20:00:00Z",
      startedAt: "2024-01-05T10:00:00Z",
      lessons: mockLessonProgress,
      streak: 15,
      badges: ["Master", "Perfect Completion", "Speed Runner"],
      status: 'completed'
    },
    {
      userId: "user-5",
      userName: "Lisa Thompson",
      userEmail: "lisa.thompson@example.com",
      userAvatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face",
      overallProgress: 25,
      completedLessons: 3,
      totalLessons: 12,
      totalTimeSpent: 120,
      averageScore: 72,
      lastActiveAt: "2024-01-14T13:20:00Z",
      startedAt: "2024-01-13T15:45:00Z",
      lessons: mockLessonProgress.slice(0, 1),
      streak: 0,
      badges: [],
      status: 'inactive'
    }
  ],
  totalUsers: 5,
  activeUsers: 2,
  completedUsers: 1,
  strugglingUsers: 1
};

export const mockDetailedUserData: UserDetailResponse = {
  userId: "user-1",
  userName: "Sarah Johnson",
  userEmail: "sarah.johnson@example.com",
  userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9e2f022?w=100&h=100&fit=crop&crop=face",
  overallProgress: 75,
  completedLessons: 8,
  totalLessons: 12,
  totalTimeSpent: 480,
  averageScore: 85,
  lastActiveAt: "2024-01-20T10:30:00Z",
  startedAt: "2024-01-10T09:00:00Z",
  lessons: mockDetailedLessonProgress,
  streak: 7,
  badges: ["Fast Learner", "Perfect Score", "Consistent"],
  status: 'active',
  strugglingAreas: ["Dynamic Programming", "Graph Algorithms", "System Design"],
  strengths: ["Data Structures", "Sorting Algorithms", "Problem Analysis"],
  recommendedActions: [
    "Focus on dynamic programming practice problems",
    "Review graph traversal algorithms",
    "Complete system design fundamentals module",
    "Schedule 1-on-1 mentoring session"
  ],
  engagementLevel: 'high',
  learningVelocity: 'fast'
}; 