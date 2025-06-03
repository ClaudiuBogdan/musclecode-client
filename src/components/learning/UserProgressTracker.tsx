import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Target,
  Trophy,
  Users,
  Zap,
  TrendingUp,
  BookOpen,
  Timer,
  Star,
} from "lucide-react";
import { useState, useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";


// Mock data types
interface UserAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  attempts: number;
  submittedAt: string;
  feedback?: string;
}

interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  completed: boolean;
  score: number; // 0-100
  timeSpent: number; // in minutes
  completedAt?: string;
  answers: UserAnswer[];
  totalQuestions: number;
  correctAnswers: number;
}

interface UserProgress {
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
  status: 'active' | 'completed' | 'inactive';
}

// Mock data
const mockUserProgress: UserProgress[] = [
  {
    userId: "1",
    userName: "Alice Johnson",
    userEmail: "alice.johnson@example.com",
    overallProgress: 85,
    completedLessons: 17,
    totalLessons: 20,
    totalTimeSpent: 480,
    averageScore: 88,
    lastActiveAt: "2024-01-15T10:30:00Z",
    startedAt: "2024-01-01T09:00:00Z",
    streak: 12,
    badges: ["Quick Learner", "Perfect Score", "Consistent"],
    status: 'active',
    lessons: [
      {
        lessonId: "1",
        lessonTitle: "Introduction to Variables",
        completed: true,
        score: 95,
        timeSpent: 25,
        completedAt: "2024-01-02T14:30:00Z",
        totalQuestions: 10,
        correctAnswers: 9,
        answers: [
          {
            questionId: "q1",
            questionText: "What is a variable in programming?",
            userAnswer: "A variable is a container that stores data values.",
            correctAnswer: "A variable is a container that stores data values.",
            isCorrect: true,
            timeSpent: 45,
            attempts: 1,
            submittedAt: "2024-01-02T14:15:00Z",
            feedback: "Excellent! You understand the basic concept of variables."
          },
          {
            questionId: "q2",
            questionText: "Which of the following is a valid variable name?",
            userAnswer: "myVariable",
            correctAnswer: "myVariable",
            isCorrect: true,
            timeSpent: 30,
            attempts: 1,
            submittedAt: "2024-01-02T14:16:00Z"
          }
        ]
      },
      {
        lessonId: "2",
        lessonTitle: "Data Types and Operations",
        completed: true,
        score: 78,
        timeSpent: 35,
        completedAt: "2024-01-03T16:45:00Z",
        totalQuestions: 15,
        correctAnswers: 12,
        answers: []
      }
    ]
  },
  {
    userId: "2",
    userName: "Bob Smith",
    userEmail: "bob.smith@example.com",
    overallProgress: 45,
    completedLessons: 9,
    totalLessons: 20,
    totalTimeSpent: 280,
    averageScore: 72,
    lastActiveAt: "2024-01-10T15:20:00Z",
    startedAt: "2024-01-05T11:00:00Z",
    streak: 5,
    badges: ["Getting Started"],
    status: 'active',
    lessons: []
  },
  {
    userId: "3",
    userName: "Carol Davis",
    userEmail: "carol.davis@example.com",
    overallProgress: 100,
    completedLessons: 20,
    totalLessons: 20,
    totalTimeSpent: 520,
    averageScore: 94,
    lastActiveAt: "2024-01-12T12:00:00Z",
    startedAt: "2023-12-20T10:00:00Z",
    streak: 25,
    badges: ["Master", "Perfect Score", "Speed Demon", "Consistent"],
    status: 'completed',
    lessons: []
  }
];

interface UserProgressTrackerProps {
  moduleId: string;
}

export function UserProgressTracker({ moduleId }: UserProgressTrackerProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("progress");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = mockUserProgress.filter(user => {
      const matchesSearch = user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.overallProgress - a.overallProgress;
        case "name":
          return a.userName.localeCompare(b.userName);
        case "score":
          return b.averageScore - a.averageScore;
        case "activity":
          return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users (Not implemented)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserProgress.length}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in module
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress (Not implemented)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockUserProgress.reduce((acc, user) => acc + user.overallProgress, 0) / mockUserProgress.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed (Not implemented)</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUserProgress.filter(user => user.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Users finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score (Not implemented)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockUserProgress.reduce((acc, user) => acc + user.averageScore, 0) / mockUserProgress.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average test score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">User Progress Overview (Not implemented)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor individual user progress and performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("progress")}>
                    Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("score")}>
                    Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("activity")}>
                    Last Activity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all bg-background cursor-pointer"
                onClick={() => {
                  void navigate({
                    to: '/learning/modules/$moduleId/users/$userId',
                    params: { moduleId, userId: user.userId }
                  });
                }}
              >
                <Avatar className="h-12 w-12 ring-2 ring-muted">
                  <AvatarImage src={user.userAvatar} alt={user.userName} />
                  <AvatarFallback className="text-sm font-semibold">
                    {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold truncate">{user.userName}</div>
                    <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                      {user.status}
                    </Badge>
                    {user.streak > 0 && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Zap className="h-3 w-3" />
                        {user.streak} day streak
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{user.userEmail}</div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {user.completedLessons}/{user.totalLessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatTime(user.totalTimeSpent)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {user.averageScore}% avg
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.lastActiveAt)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span className="font-medium">{user.overallProgress}%</span>
                    </div>
                    <Progress value={user.overallProgress} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.badges.slice(0, 2).map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                  {user.badges.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.badges.length - 2}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
} 