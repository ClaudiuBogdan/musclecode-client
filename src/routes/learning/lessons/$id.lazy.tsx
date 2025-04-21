import { ContentLayout } from "@/components/learning/ContentLayout";
import { useLesson } from "@/services/content/hooks";
import { ExerciseCard } from "@/components/learning/ExerciseCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircleIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  BookOpenIcon 
} from "lucide-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";

export const Route = createLazyFileRoute("/learning/lessons/$id")({
  component: LessonDetailPage,
});

function LessonDetailPage() {
  const { id } = Route.useParams();
  const { data: lesson, isLoading, error } = useLesson(id);
  
  // Get a safe title with a fallback
  const title = lesson?.body?.title as string || "Lesson";
  // Get a safe content with a fallback
  const content = lesson?.body?.content as string || "";

  return (
    <ContentLayout 
      title={isLoading ? "Loading..." : title}
      backLink={lesson ? `/learning/modules/${lesson.moduleId}` : "/learning/modules/"}
    >
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load lesson details. Please try again later.
          </AlertDescription>
        </Alert>
      ) : lesson ? (
        <div className="space-y-8">
          {/* Lesson content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>
                Module: {lesson.moduleId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Markdown content={content} />
            </CardContent>
          </Card>

          {/* Exercises section */}
          {lesson.exercises && lesson.exercises.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Exercises</h2>
              <div className="grid grid-cols-1 gap-4">
                {lesson.exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Module
            </Button>
            
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                // This would navigate to the next lesson or exercise in a real implementation
                window.history.back();
              }}
            >
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </ContentLayout>
  );
} 