import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Flag,
  HelpCircle,
  Mail,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Repeat,
  RotateCcw,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";


import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserDetail } from "@/services/learning/hooks";



interface UserDetailedProgressProps {
  moduleId: string;
  userId: string;
}

export function UserDetailedProgress({ moduleId, userId }: UserDetailedProgressProps) {
  const [activeTab, setActiveTab] = useState("analytics");

  // Fetch user detail data
  const { data: user, isLoading, error } = useUserDetail(moduleId, userId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-6 rounded-lg border">
            <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-lg border">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error ? `Failed to load user details: ${error.message}` : 'User not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'struggling': return 'bg-orange-100 text-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleSendMessage = () => {
    // In real implementation, this would open a messaging interface
    console.log("Send message to", user.userName);
  };

  const handleScheduleMeeting = () => {
    // In real implementation, this would open a scheduling interface
    console.log("Schedule meeting with", user.userName);
  };

  const handleExportReport = () => {
    // In real implementation, this would generate and download a report
    console.log("Export report for", user.userName);
  };

  const strugglingLessons = user.lessons.filter(lesson => lesson.score < 70);
  const excellentLessons = user.lessons.filter(lesson => lesson.score >= 90);
  const avgAttempts = user.lessons.reduce((acc, lesson) => acc + lesson.attempts, 0) / user.lessons.length;

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-muted">
                  <AvatarImage src={user.userAvatar} alt={user.userName} />
                  <AvatarFallback className="text-sm font-semibold">
                    {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-bold">{user.userName}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.userEmail}</span>
                    <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSendMessage} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" size="sm" onClick={handleScheduleMeeting} className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportReport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Parent/Manager
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="lessons">Lesson Details</TabsTrigger>
            <TabsTrigger value="answers">Answer Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Action Items</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.overallProgress}%</div>
                  <Progress value={user.overallProgress} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.completedLessons}/{user.totalLessons} lessons completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.averageScore}%</div>
                  <div className="flex items-center gap-1 mt-2">
                    {user.averageScore >= 80 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {user.averageScore >= 80 ? 'Excellent' : 'Needs Attention'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Investment</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(user.totalTimeSpent)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(user.totalTimeSpent / user.completedLessons)}min avg per lesson
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold capitalize ${getEngagementColor(user.engagementLevel)}`}>
                    {user.engagementLevel}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">
                      {user.streak} day streak
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strengths & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Strong Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.strengths.map((strength) => (
                        <Badge key={strength} variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-sm mb-2">Badges Earned</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.badges.map((badge) => (
                        <Badge key={badge} variant="outline" className="gap-1">
                          <Award className="h-3 w-3" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Struggling Areas</h4>
                    <div className="space-y-2">
                      {user.strugglingAreas.map((area) => (
                        <div key={area} className="flex items-center justify-between p-2 rounded bg-orange-50 dark:bg-orange-900/20">
                          <span className="text-sm">{area}</span>
                          <Badge variant="outline" className="text-xs">
                            Needs Focus
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Performance Indicators</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Lessons needing retakes:</span>
                        <span className="font-medium">{strugglingLessons.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average attempts per lesson:</span>
                        <span className="font-medium">{avgAttempts.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Learning velocity:</span>
                        <span className={`font-medium capitalize ${user.learningVelocity === 'fast' ? 'text-green-600' :
                            user.learningVelocity === 'slow' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                          {user.learningVelocity}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Learning Progress Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600">{excellentLessons.length}</div>
                      <div className="text-green-700 dark:text-green-300">Excellent Lessons (90%+)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-2xl font-bold text-blue-600">{user.completedLessons - excellentLessons.length - strugglingLessons.length}</div>
                      <div className="text-blue-700 dark:text-blue-300">Good Lessons (70-89%)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="text-2xl font-bold text-orange-600">{strugglingLessons.length}</div>
                      <div className="text-orange-700 dark:text-orange-300">Needs Review (&lt;70%)</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">Started learning:</span>
                      <span className="text-muted-foreground">{formatDate(user.startedAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="font-medium">Last activity:</span>
                      <span className="text-muted-foreground">{formatDate(user.lastActiveAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            {user.lessons.map((lesson) => (
              <Card key={lesson.lessonId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-500" />
                      )}
                      {lesson.lessonTitle}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={lesson.score >= 80 ? "default" : lesson.score >= 60 ? "secondary" : "destructive"}>
                        {lesson.score}% Score
                      </Badge>
                      {lesson.attempts > 1 && (
                        <Badge variant="outline" className="gap-1">
                          <Repeat className="h-3 w-3" />
                          {lesson.attempts} attempts
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Questions</div>
                      <div className="font-semibold">{lesson.correctAnswers}/{lesson.totalQuestions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Time Spent</div>
                      <div className="font-semibold">{formatTime(lesson.timeSpent)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Completion</div>
                      <div className="font-semibold">
                        {lesson.completedAt ? formatDate(lesson.completedAt) : "In Progress"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className={`font-semibold ${lesson.score >= 80 ? 'text-green-600' : lesson.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {lesson.score >= 80 ? 'Excellent' : lesson.score >= 60 ? 'Good' : 'Needs Review'}
                      </div>
                    </div>
                  </div>

                  {lesson.strugglingTopics.length > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Struggling with:</strong> {lesson.strugglingTopics.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lesson.strongTopics.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-green-700">Strong Topics</h4>
                        <div className="flex flex-wrap gap-1">
                          {lesson.strongTopics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {lesson.strugglingTopics.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-orange-700">Needs Improvement</h4>
                        <div className="flex flex-wrap gap-1">
                          {lesson.strugglingTopics.map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            {user.lessons
              .filter(lesson => lesson.answers && lesson.answers.length > 0)
              .map((lesson) => (
                <Card key={lesson.lessonId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{lesson.lessonTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {lesson.answers?.map((answer, index) => (
                        <div key={answer.questionId} className="space-y-4 p-4 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Question {index + 1}
                                </Badge>
                                <Badge variant={answer.difficulty === 'hard' ? 'destructive' : answer.difficulty === 'medium' ? 'secondary' : 'default'} className="text-xs">
                                  {answer.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {answer.topic}
                                </Badge>
                              </div>
                              <div className="font-medium">{answer.questionText}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {answer.isCorrect ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Correct
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Incorrect
                                </Badge>
                              )}
                              <Badge variant="outline" className="gap-1">
                                <RotateCcw className="h-3 w-3" />
                                {answer.attempts} attempts
                              </Badge>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Student Answer:
                              </div>
                              <div className="text-sm p-3 rounded bg-muted/50 font-mono">
                                {answer.userAnswer}
                              </div>
                            </div>

                            {!answer.isCorrect && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Correct Answer:
                                </div>
                                <div className="text-sm p-3 rounded bg-green-50 dark:bg-green-900/20 font-mono">
                                  {answer.correctAnswer}
                                </div>
                              </div>
                            )}

                            {answer.feedback && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Feedback:
                                </div>
                                <div className="text-sm p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                                  {answer.feedback}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {Math.floor(answer.timeSpent / 60)}m {answer.timeSpent % 60}s
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(answer.submittedAt)}
                            </div>
                            {answer.attempts > 1 && (
                              <div className="flex items-center gap-1">
                                <Repeat className="h-3 w-3" />
                                Multiple attempts - review understanding
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Trainer Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{action}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Quick Communications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Send Encouragement Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Check-in Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Assign Study Partner
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <BookOpen className="h-4 w-4" />
                    Recommend Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Intervention Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strugglingLessons.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{strugglingLessons.length} lessons</strong> need review. Consider additional practice or one-on-one sessions.
                      </AlertDescription>
                    </Alert>
                  )}
                  {avgAttempts > 2 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>High retry rate</strong> - Student may benefit from different learning approach or prerequisite review.
                      </AlertDescription>
                    </Alert>
                  )}
                  {user.engagementLevel === 'low' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Low engagement</strong> - Consider motivation strategies or checking for external factors.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 