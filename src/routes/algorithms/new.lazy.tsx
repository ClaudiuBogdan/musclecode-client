import { DescriptionEditor } from "@/components/algorithms-editor/description/DescriptionEditor";
import { FilesEditor } from "@/components/algorithms-editor/code/FilesEditor";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNewAlgorithmStore } from "@/stores/newAlgorithm";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RotateCcw, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlgorithmValidation } from "@/hooks/useAlgorithmValidation";
import { cn } from "@/lib/utils";
import { showToast } from "@/utils/toast";

export const Route = createLazyFileRoute("/algorithms/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("metadata");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const {
    algorithm,
    isLoading,
    error,
    setTitle,
    setDifficulty,
    setTags,
    setDescription,
    saveAlgorithm,
    resetState,
  } = useNewAlgorithmStore();

  const validation = useAlgorithmValidation(algorithm);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast.error(error);
    }
  }, [error]);

  const handleSave = useCallback(async () => {
    if (!validation.isValid) {
      // Switch to the first tab with errors
      if (validation.firstErrorTab) {
        setActiveTab(validation.firstErrorTab);
        // Show all errors in the current tab
        const errors = validation.getErrorsForTab(validation.firstErrorTab);
        errors.forEach((error) => {
          showToast.error(error.message);
        });
      }
      return;
    }

    try {
      await saveAlgorithm();
      showToast.success("Algorithm created successfully!");
      navigate({ to: "/algorithms" });
    } catch (error) {
      // Error is already handled by the store and shown in toast
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save algorithm";
      showToast.error(errorMessage);
    }
  }, [validation, saveAlgorithm, navigate, setActiveTab]);

  const handleTagsChange = useCallback(
    (value: string) => {
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      setTags(tags);
    },
    [setTags]
  );

  const handleReset = useCallback(() => {
    resetState();
    setShowResetDialog(false);
    showToast.success("Algorithm state reset successfully");
  }, [resetState]);

  const hasContent = Boolean(
    algorithm.metadata.title ||
      algorithm.metadata.tags.length > 0 ||
      algorithm.description.content ||
      algorithm.languages.length > 0
  );

  return (
    <>
      <div className="container mx-auto py-6 h-[calc(100vh-5rem)] flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Algorithm</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              disabled={isLoading || !hasContent}
              className="gap-2"
              title={!hasContent ? "No content to reset" : "Reset all content"}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/algorithms" })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Algorithm"
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger
              value="metadata"
              className={cn(
                validation.hasErrorsInTab("metadata") && "text-destructive"
              )}
              data-has-error={validation.hasErrorsInTab("metadata")}
            >
              Metadata
              {validation.hasErrorsInTab("metadata") && (
                <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className={cn(
                validation.hasErrorsInTab("description") && "text-destructive"
              )}
              data-has-error={validation.hasErrorsInTab("description")}
            >
              Description
              {validation.hasErrorsInTab("description") && (
                <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="solutions"
              className={cn(
                validation.hasErrorsInTab("solutions") && "text-destructive"
              )}
              data-has-error={validation.hasErrorsInTab("solutions")}
            >
              Solutions
              {validation.hasErrorsInTab("solutions") && (
                <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="flex-1">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="flex items-center gap-1">
                      Title
                      <span className="text-destructive">*</span>
                    </Label>
                    {validation.getErrorsForField("title").map((error) => (
                      <span
                        key={error.message}
                        className="text-sm text-destructive"
                      >
                        {error.message}
                      </span>
                    ))}
                  </div>
                  <Input
                    id="title"
                    placeholder="Algorithm title..."
                    value={algorithm.metadata.title}
                    onChange={(e) => setTitle(e.target.value.trimStart())}
                    maxLength={100}
                    required
                    className={cn(
                      validation.getErrorsForField("title").length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="w-full p-2 rounded-md border dark:bg-background"
                    value={algorithm.metadata.difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tags">Tags</Label>
                    {validation.getErrorsForField("tags").map((error) => (
                      <span
                        key={error.message}
                        className="text-sm text-destructive"
                      >
                        {error.message}
                      </span>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    placeholder="Add tags separated by commas..."
                    value={algorithm.metadata.tags.join(", ")}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    maxLength={200}
                    className={cn(
                      validation.getErrorsForField("tags").length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="h-full">
            <Card className="h-full">
              <div className="flex flex-col h-full">
                <div className="px-4 pt-4 flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    Description
                    <span className="text-destructive">*</span>
                  </Label>
                  {validation.getErrorsForField("content").map((error) => (
                    <span
                      key={error.message}
                      className="text-sm text-destructive"
                    >
                      {error.message}
                    </span>
                  ))}
                </div>
                <DescriptionEditor
                  isPreview={false}
                  value={algorithm.description.content}
                  onChange={setDescription}
                  hasError={validation.getErrorsForField("content").length > 0}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="solutions" className="h-full">
            <Card className="h-full">
              <div className="flex flex-col h-full">
                <div className="px-4 pt-4 flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    Solutions
                    <span className="text-destructive">*</span>
                  </Label>
                  {validation.getErrorsForField("languages").map((error) => (
                    <span
                      key={error.message}
                      className="text-sm text-destructive"
                    >
                      {error.message}
                    </span>
                  ))}
                </div>
                <FilesEditor
                  isPreview={false}
                  languages={algorithm.languages}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Algorithm State?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your current progress including metadata,
              description, and all language solutions. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReset}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
