import { ContentLayout } from "@/components/learning/ContentLayout";
import { useModule } from "@/services/content/hooks";
import { LessonCard } from "@/components/learning/LessonCard";
import { ExerciseCard } from "@/components/learning/ExerciseCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, BookIcon, BookOpenIcon, BarChartIcon } from "lucide-react";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/learning/modules/$moduleId/")({
  component: ModuleDetailPage,
});

function ModuleDetailPage() {
  const { moduleId } = Route.useParams();
  const { data: module, isLoading, error } = useModule(moduleId);
  
  // Mock progress for now - in a real app this would come from the user's progress data
  const progress = 25;

  // Get a safe title with a fallback
  const title = module?.body?.title as string || "Module";
  // Get a safe description with a fallback
  const description = module?.body?.description as string || "";

  return (
    <ContentLayout 
      title={isLoading ? "Loading..." : title}
      backLink="/learning/modules/"
    >
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-1 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load module details. Please try again later.
          </AlertDescription>
        </Alert>
      ) : module ? (
        <div className="space-y-6">
          {/* Module description */}
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{description}</p>

            {/* Progress card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Your Progress</span>
                  </div>
                  <div className="w-full sm:w-2/3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{progress}% completed</span>
                      <span>
                        {module.lessons?.length || 0} Lessons · {module.exercises?.length || 0} Exercises
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons and Exercises Tabs */}
          <Tabs defaultValue="lessons" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="lessons" className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                <span>Lessons</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <BookIcon className="h-4 w-4" />
                <span>Exercises</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="lessons" className="mt-0">
              {module.lessons && module.lessons.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {module.lessons.map((lesson, index) => (
                    <LessonCard 
                      key={lesson.id} 
                      moduleId={moduleId}
                      lesson={lesson} 
                      index={index + 1} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    This module doesn't have any lessons yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="exercises" className="mt-0">
              {module.exercises && module.exercises.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {module.exercises.map((exercise, index) => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise} 
                      index={index + 1} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    This module doesn't have any exercises yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </ContentLayout>
  );
} 