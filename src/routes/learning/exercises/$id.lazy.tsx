import { ContentLayout } from "@/components/learning/ContentLayout";
import { useExercise } from "@/services/content/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircleIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CodeIcon,
  FileTextIcon,
  PlayIcon,
  CheckCircleIcon
} from "lucide-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const Route = createLazyFileRoute("/learning/exercises/$id")({
  component: ExerciseDetailPage,
});

function ExerciseDetailPage() {
  const { id } = Route.useParams();
  const { data: exercise, isLoading, error } = useExercise(id);
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Mock submission function
  const handleRunCode = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };
  
  // Get a safe title with a fallback
  const title = exercise?.body?.title as string || "Exercise";
  // Get safe content with fallbacks
  const description = exercise?.body?.description as string || "";
  const instructions = exercise?.body?.instructions as string || "";
  const content = exercise?.body?.content as string || "";

  return (
    <ContentLayout 
      title={isLoading ? "Loading..." : title}
      backLink={exercise?.lessonId 
        ? `/learning/lessons/${exercise.lessonId}` 
        : exercise?.moduleId
        ? `/learning/modules/${exercise.moduleId}`
        : "/learning/modules/"
      }
    >
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load exercise details. Please try again later.
          </AlertDescription>
        </Alert>
      ) : exercise ? (
        <div className="space-y-6">
          {/* Exercise description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CodeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>
                {exercise.lessonId 
                  ? `Part of Lesson: ${exercise.lessonId}`
                  : `Part of Module: ${exercise.moduleId}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2">Instructions:</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {instructions.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor and Preview */}
          <Tabs defaultValue="editor" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <CodeIcon className="h-4 w-4" />
                <span>Code Editor</span>
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                <span>Exercise Content</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  {/* This would be a real code editor in a real implementation */}
                  <div className="w-full h-80 bg-gray-900 text-gray-100 font-mono p-4 rounded-md overflow-auto">
                    <textarea 
                      value={code} 
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Write your code here..."
                      className="w-full h-full bg-transparent border-none outline-none resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => setCode("")}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="default"
                      disabled={isSubmitting || !code.trim()}
                      onClick={handleRunCode}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>Running...</>
                      ) : isSuccess ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Success!
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4" />
                          Run Code
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                // This would navigate to the next exercise in a real implementation
                window.history.back();
              }}
            >
              Next Exercise
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </ContentLayout>
  );
} 