import { createLazyFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, XIcon, ZapIcon } from "lucide-react";

import { LessonChunkRenderer } from "@/components/learning/LessonChunkRenderer";
import { LessonProgressBar } from "@/components/learning/LessonProgressBar";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { convertInteractionBodyToData } from "@/services/content/api";
import { useLesson } from "@/services/content/hooks";
import { useChunkNavigation } from "@/services/learning/hooks/useChunkNavigation";

import type { LessonBody } from "@/types/lesson";

export const Route = createLazyFileRoute("/learning/modules/$moduleId/lessons/$lessonId")({
  component: LessonDetailPage,
});

function LessonDetailPage() {
  const { moduleId, lessonId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { data, isLoading, error, refetch } = useLesson(lessonId);
  const [currentChunkIndex, setCurrentChunkIndex] = useChunkNavigation();

  const { lesson, permission, interaction } = data?.data ?? {};

  console.log({ lesson, permission, interaction });

  // Convert interaction data from new format to legacy format for backward compatibility
  const legacyInteractionData = interaction ? convertInteractionBodyToData(interaction) : undefined;

  // Get lesson body with proper typing
  const lessonBody = lesson?.body as LessonBody | undefined;

  // Get chunks safely
  const chunks = lessonBody?.chunks ?? [];

  // Handler for completing a chunk
  const handleCompleteChunk = () => {
    if (!lesson || currentChunkIndex >= chunks.length - 1) {
      // Last chunk - complete the lesson (navigate back or to results?)
      // For now, navigate back to the module
      if (lesson) {
        void navigate({ to: `/learning/modules/${moduleId}` });
      }
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
    handleCompleteChunk(); // Skip logic might need refinement, for now just advances
  };

  // Handler for closing the lesson
  const handleClose = () => {
    // Navigate back to the module page or dashboard
    if (lesson) {
      void navigate({ to: `/learning/modules/${moduleId}` });
    } else {
      void navigate({ to: '/learning/modules' });
    }
  };

  // Determine if the current chunk is the last one
  const isLastChunk = currentChunkIndex === chunks.length - 1;

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen p-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <ErrorDisplay
          error={error}
          title="Failed to Load Lesson"
          className="max-w-md"
          showRetry={true}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  // Display empty lesson state
  if (!lesson || chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No content found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">This lesson doesn&apos;t have any content yet.</p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.history.back()} // Or use navigate
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Module
        </Button>
      </div>
    );
  }

  // Main Lesson Layout
  return (
    <div className="flex flex-col h-dvh bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close lesson">
            <XIcon className="h-5 w-5" />
          </Button>
          <div className="flex-grow px-4">
            <LessonProgressBar chunks={chunks} currentChunkIndex={currentChunkIndex} />
          </div>
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
            <ZapIcon className="h-5 w-5 fill-current" />
            <span>20</span> {/* Placeholder for points */}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <LessonChunkRenderer
            chunk={chunks[currentChunkIndex]}
            lessonId={lessonId}
            interactionData={legacyInteractionData}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          {currentChunkIndex > 0 ? (
            <Button variant="outline" onClick={handlePreviousChunk} className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </Button>
          ) : (
            <div /> // Placeholder to maintain space
          )}
          <div className="flex gap-2">
            {chunks[currentChunkIndex]?.type !== 'note' && (
              <Button variant="ghost" onClick={handleSkipChunk}>
                Skip
              </Button>
            )}
            <Button variant="default" onClick={handleCompleteChunk} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {isLastChunk ? 'Finish' : 'Next'}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}