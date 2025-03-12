import { NewAlgorithm } from "@/types/newAlgorithm";
import { CodeLanguage } from "@/types/algorithm";
import { useCallback, useMemo, useState } from "react";
import { Loader2, RotateCcw, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DescriptionEditor } from "./description/DescriptionEditor";
import { FilesEditor } from "./code/FilesEditor";
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
import { cn } from "@/lib/utils";
import { showToast } from "@/utils/toast";
import { ValidationError } from "@/types/newAlgorithm";
import {
  MAX_SUMMARY_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_LESSON_TITLE_LENGTH,
} from "@/stores/baseAlgorithm";
import { categories as predefinedCategories } from "../algorithms/data";
import { Code2 } from "lucide-react";
import { createLogger } from "@/lib/logger";
import { MultiSelect } from "@/components/ui/multi-select";

const logger = createLogger("AlgorithmForm");

// Helper function to convert a string to kebab case
function toKebabCase(str: string): string {
  logger.debug("String Transform Started", {
    operation: "kebabCase",
    inputLength: str.length,
  });
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Helper function to merge categories and ensure no duplicates
function mergeCategories(serverCategories: string[] = []) {
  logger.debug("Category Merge Started", {
    sourceStats: {
      predefined: predefinedCategories.length,
      server: serverCategories.length,
    },
  });
  const merged = new Map(predefinedCategories.map((cat) => [cat.value, cat]));

  // Add server categories that don't exist in predefined list
  serverCategories.forEach((category) => {
    const value = toKebabCase(category);
    if (!merged.has(value)) {
      logger.debug("Category Added", {
        source: "server",
        categoryType: value,
      });
      merged.set(value, {
        value,
        label: category,
        icon: Code2, // Default icon for server-provided categories
      });
    }
  });

  const mergedCategories = Array.from(merged.values());
  logger.debug("Category Merge Completed", {
    stats: {
      total: mergedCategories.length,
      added: mergedCategories.length - predefinedCategories.length,
    },
  });
  return mergedCategories;
}

export interface ValidationResult {
  errors: ValidationError[];
  getErrorsForTab: (
    tab: "metadata" | "description" | "solutions"
  ) => ValidationError[];
  getErrorsForField: (field: string) => ValidationError[];
  hasErrorsInTab: (tab: "metadata" | "description" | "solutions") => boolean;
  firstErrorTab: "metadata" | "description" | "solutions" | null;
  isValid: boolean;
}

export interface AlgorithmFormProps {
  // State
  algorithm: NewAlgorithm;
  isLoading: boolean;
  error: string | null;
  validation: ValidationResult;
  mode: "new" | "edit";
  serverCategories?: string[];

  // Metadata handlers
  onTitleChange: (title: string) => void;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
  onSummaryChange: (summary: string) => void;
  onTagsChange: (tags: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;

  // Lesson handlers
  onLessonAdd: (title: string, content: string) => void;
  onLessonUpdate: (lessonId: string, title: string, content: string) => void;
  onLessonRemove: (lessonId: string) => void;

  // Language handlers
  onLanguageAdd: (language: CodeLanguage) => void;
  onLanguageRemove: (languageId: string) => void;
  onFileContentChange: (fileId: string, content: string) => void;

  // Form actions
  onSave: () => Promise<void>;
  onReset: () => void;
  onCancel: () => void;
}

export function AlgorithmForm({
  // State
  algorithm,
  isLoading,
  validation,
  mode,
  serverCategories = [],

  // Metadata handlers
  onTitleChange,
  onDifficultyChange,
  onSummaryChange,
  onTagsChange,
  onCategoriesChange: onCategoryChange,

  // Lesson handlers
  onLessonAdd,
  onLessonUpdate,
  onLessonRemove,

  // Language handlers
  onLanguageAdd,
  onLanguageRemove,
  onFileContentChange,

  // Form actions
  onSave,
  onReset,
  onCancel,
}: AlgorithmFormProps & { serverCategories?: string[] }) {
  const [activeTab, setActiveTab] = useState("metadata");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const currentCategories = algorithm.metadata.categories;
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Merge predefined and server categories
  const allCategories = useMemo(
    () => mergeCategories(serverCategories),
    [serverCategories]
  );

  // Sort categories with current categories first
  const sortedCategories = useMemo(() => {
    logger.debug("Sorting categories", {
      currentCategories,
      totalCategories: allCategories.length,
    });

    const categories = [...allCategories];
    // Move current categories to the top
    categories.sort((a, b) => {
      const aSelected = currentCategories.includes(a.value);
      const bSelected = currentCategories.includes(b.value);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    logger.debug("Sorted categories", { sortedCount: categories.length });
    return categories;
  }, [currentCategories, allCategories]);

  const handleSave = useCallback(async () => {
    logger.debug("Save Operation Started", {
      validationState: {
        isValid: validation.isValid,
        firstErrorTab: validation.firstErrorTab,
      },
    });

    if (!validation.isValid) {
      // Switch to the first tab with errors
      if (validation.firstErrorTab) {
        logger.info("Form Validation Failed", {
          targetTab: validation.firstErrorTab,
          errorCount: validation.getErrorsForTab(validation.firstErrorTab)
            .length,
        });
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
      await onSave();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save algorithm";
      logger.error("Save Operation Failed", {
        error: error instanceof Error ? error : new Error(errorMessage),
        mode,
        hasContent: Boolean(algorithm.metadata.title),
      });
      showToast.error(errorMessage);
    }
  }, [validation, onSave, mode, algorithm.metadata.title]);

  const handleTagsChange = useCallback(
    (value: string) => {
      logger.debug("Tags Update Started", {
        stats: {
          inputLength: value.length,
          tagCount: value.split(",").length,
        },
      });
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      logger.debug("Tags Update Completed", {
        stats: {
          validTags: tags.length,
        },
      });
      onTagsChange(tags);
    },
    [onTagsChange]
  );

  const handleAddLesson = useCallback(() => {
    if (!newLessonTitle.trim()) {
      showToast.error("Lesson title is required");
      return;
    }
    onLessonAdd(newLessonTitle.trim(), "");
    setNewLessonTitle("");
  }, [newLessonTitle, onLessonAdd]);

  const hasContent = Boolean(
    algorithm.metadata.title ||
      algorithm.metadata.tags.length > 0 ||
      algorithm.lessons.length > 0 ||
      algorithm.files.length > 0
  );

  const handleReset = useCallback(() => {
    logger.info("Form Reset Triggered", {
      formState: {
        mode,
        hasContent,
      },
    });
    onReset();
    setShowResetDialog(false);
    showToast.success("Algorithm state reset successfully");
  }, [onReset, mode, hasContent]);

  return (
    <>
      <div className="container mx-auto py-6 h-[calc(100vh-5rem)] flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {mode === "edit" ? "Edit Algorithm" : "Create New Algorithm"}
          </h1>
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
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
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
              ) : mode === "edit" ? (
                "Save Changes"
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
              Lessons
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
                    onChange={(e) => onTitleChange(e.target.value.trimStart())}
                    maxLength={MAX_TITLE_LENGTH}
                    required
                    className={cn(
                      validation.getErrorsForField("title").length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="summary" className="flex items-center gap-1">
                    Summary
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="summary"
                    placeholder="Algorithm summary..."
                    value={algorithm.metadata.summary}
                    onChange={(e) => onSummaryChange(e.target.value)}
                    maxLength={MAX_SUMMARY_LENGTH}
                    required
                    className={cn(
                      validation.getErrorsForField("summary").length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="categories"
                    className="flex items-center gap-1"
                  >
                    Categories
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-col gap-1.5">
                    {validation.getErrorsForField("categories").map((error) => (
                      <span
                        key={error.message}
                        className="text-sm text-destructive"
                      >
                        {error.message}
                      </span>
                    ))}
                    {/* // TODO: FIXME: fix this */}
                    <MultiSelect
                      options={sortedCategories}
                      selected={currentCategories}
                      onChange={onCategoryChange}
                      placeholder="Select categories"
                      searchPlaceholder="Search categories..."
                      emptyText="No categories found."
                      error={
                        validation.getErrorsForField("categories").length > 0
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="difficulty"
                      className="flex items-center gap-1"
                    >
                      Difficulty
                      <span className="text-destructive">*</span>
                    </Label>
                    {validation.getErrorsForField("difficulty").map((error) => (
                      <span
                        key={error.message}
                        className="text-sm text-destructive"
                      >
                        {error.message}
                      </span>
                    ))}
                  </div>
                  <select
                    id="difficulty"
                    className={cn(
                      "w-full p-2 rounded-md border dark:bg-background",
                      validation.getErrorsForField("difficulty").length > 0 &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    value={algorithm.metadata.difficulty}
                    onChange={(e) =>
                      onDifficultyChange(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                  >
                    <option value="">Select difficulty</option>
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
                    Lessons
                    <span className="text-destructive">*</span>
                  </Label>
                  {validation.getErrorsForField("lessons").map((error) => (
                    <span
                      key={error.message}
                      className="text-sm text-destructive"
                    >
                      {error.message}
                    </span>
                  ))}
                </div>

                {/* Add new lesson */}
                <div className="px-4 py-2 flex items-center gap-2">
                  <Input
                    placeholder="New lesson title..."
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    maxLength={MAX_LESSON_TITLE_LENGTH}
                    className="flex-1"
                  />
                  <Button onClick={handleAddLesson} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </Button>
                </div>

                {/* Lessons list */}
                {algorithm.lessons.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No lessons added yet. Add your first lesson above.
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      {algorithm.lessons.map((lesson) => (
                        <div key={lesson.id} className="border rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{lesson.title}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setEditingLessonId(
                                    lesson.id === editingLessonId
                                      ? null
                                      : lesson.id
                                  )
                                }
                              >
                                {lesson.id === editingLessonId
                                  ? "Close"
                                  : "Edit"}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onLessonRemove(lesson.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {lesson.id === editingLessonId ? (
                            <div className="mt-2">
                              <div className="mb-2">
                                <Label htmlFor={`lesson-title-${lesson.id}`}>
                                  Title
                                </Label>
                                <Input
                                  id={`lesson-title-${lesson.id}`}
                                  value={lesson.title}
                                  onChange={(e) =>
                                    onLessonUpdate(
                                      lesson.id,
                                      e.target.value,
                                      lesson.content
                                    )
                                  }
                                  maxLength={MAX_LESSON_TITLE_LENGTH}
                                  className="mb-2"
                                />
                              </div>
                              <Label htmlFor={`lesson-content-${lesson.id}`}>
                                Content
                              </Label>
                              <DescriptionEditor
                                isPreview={false}
                                value={lesson.content}
                                onChange={(content) =>
                                  onLessonUpdate(
                                    lesson.id,
                                    lesson.title,
                                    content
                                  )
                                }
                                hasError={false}
                              />
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {lesson.content ? (
                                <div className="max-h-20 overflow-hidden text-ellipsis">
                                  {lesson.content.substring(0, 150)}
                                  {lesson.content.length > 150 && "..."}
                                </div>
                              ) : (
                                <div className="text-muted-foreground italic">
                                  No content
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  files={algorithm.files}
                  onLanguageAdd={onLanguageAdd}
                  onLanguageRemove={onLanguageRemove}
                  onFileContentChange={onFileContentChange}
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
              lessons, and all language solutions. This action cannot be undone.
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
