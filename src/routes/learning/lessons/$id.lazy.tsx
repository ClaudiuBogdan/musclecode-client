import { ContentLayout } from "@/components/learning/ContentLayout";
import { useLesson } from "@/services/content/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LessonProgressBar } from "@/components/learning/LessonProgressBar";
import { LessonChunkRenderer } from "@/components/learning/LessonChunkRenderer";
import { LessonBody } from "@/types/lesson";

export const Route = createLazyFileRoute("/learning/lessons/$id")({
  component: LessonDetailPage,
});

function LessonDetailPage() {
  const { id } = Route.useParams();
  const { data: lesson, isLoading, error } = useLesson(id);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  // Reset chunk index when lesson changes
  useEffect(() => {
    if (lesson) {
      setCurrentChunkIndex(0);
    }
  }, [lesson?.id]);

  // Get lesson body with proper typing
  const lessonBody = lesson?.body as LessonBody | undefined;
  
  // Get chunks safely
  const chunks = lessonBody?.chunks || [];
  
  // Handler for completing a chunk
  const handleCompleteChunk = () => {
    if (!lesson || currentChunkIndex >= chunks.length - 1) {
      // Last chunk - complete the lesson
      return;
    }
    
    // Move to next chunk
    setCurrentChunkIndex(prev => prev + 1);
  };
  
  // Handler for going back to the previous chunk
  const handlePreviousChunk = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(prev => prev - 1);
    }
  };
  
  // Handler for skipping a chunk (only for question/quiz chunks)
  const handleSkipChunk = () => {
    handleCompleteChunk();
  };

  // Determine if the current chunk is the last one
  const isLastChunk = currentChunkIndex === chunks.length - 1;

  // Get a safe title with a fallback
  const title = lessonBody?.title || "Lesson";
  
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
      ) : lesson && chunks.length > 0 ? (
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          {/* Progress bar and title */}
          <div className="px-4 pt-6 pb-4">
            <LessonProgressBar chunks={chunks} currentChunkIndex={currentChunkIndex} />
            {currentChunkIndex === 0 && (
              <div className="mt-4">
                <h1 className="text-2xl font-bold mb-2">{lessonBody?.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{lessonBody?.description}</p>
              </div>
            )}
          </div>

          {/* Chunk content */}
          <div className="px-4 flex-1 overflow-auto">
            <LessonChunkRenderer
              chunk={chunks[currentChunkIndex]}
              onComplete={handleCompleteChunk}
              onSkip={chunks[currentChunkIndex]?.type !== 'note' ? handleSkipChunk : undefined}
              onPrevious={currentChunkIndex > 0 ? handlePreviousChunk : undefined}
              isLastChunk={isLastChunk}
            />
          </div>

          {/* Bottom navigation controls */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-4 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-800 z-10">
            {currentChunkIndex > 0 ? (
              <Button variant="outline" onClick={handlePreviousChunk} className="gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              {chunks[currentChunkIndex]?.type !== 'note' && (
                <Button variant="ghost" onClick={handleSkipChunk}>
                  Skip
                </Button>
              )}
              <Button variant="default" onClick={handleCompleteChunk} className="gap-2">
                {isLastChunk ? 'Finish' : 'Next'}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No content found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This lesson doesn't have any content yet.</p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Module
          </Button>
        </div>
      )}
    </ContentLayout>
  );
} 