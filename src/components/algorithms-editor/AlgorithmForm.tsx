import { NewAlgorithm } from "@/types/newAlgorithm";
import { CodeLanguage } from "@/types/algorithm";
import { useCallback, useMemo, useState } from "react";
import { Loader2, RotateCcw, AlertCircle } from "lucide-react";
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
import { MAX_SUMMARY_LENGTH, MAX_TITLE_LENGTH } from "@/stores/baseAlgorithm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const defaultAlgorithmCategories = [
  "Array",
  "String",
  "Linked List",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Search",
  "Bit Manipulation",
  "Recursion",
  "Sliding Window",
  "Dynamic Programming",
];

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

  // Metadata handlers
  onTitleChange: (title: string) => void;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
  onSummaryChange: (summary: string) => void;
  onTagsChange: (tags: string[]) => void;
  onCategoryChange: (category: string) => void;
  // Description handlers
  onDescriptionChange: (content: string) => void;

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

  // Metadata handlers
  onTitleChange,
  onDifficultyChange,
  onSummaryChange,
  onTagsChange,
  onCategoryChange,

  // Description handlers
  onDescriptionChange,

  // Language handlers
  onLanguageAdd,
  onLanguageRemove,
  onFileContentChange,

  // Form actions
  onSave,
  onReset,
  onCancel,
}: AlgorithmFormProps) {
  const [activeTab, setActiveTab] = useState("metadata");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const currentCategory = algorithm.metadata.category;
  const algorithmCategories = useMemo(() => {
    if (!currentCategory) {
      return defaultAlgorithmCategories;
    }
    const categories = defaultAlgorithmCategories.filter(
      (category) => category !== currentCategory
    );
    categories.unshift(currentCategory);
    return categories;
  }, [currentCategory]);

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
      await onSave();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save algorithm";
      showToast.error(errorMessage);
    }
  }, [validation, onSave]);

  const handleTagsChange = useCallback(
    (value: string) => {
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      onTagsChange(tags);
    },
    [onTagsChange]
  );

  const handleReset = useCallback(() => {
    onReset();
    setShowResetDialog(false);
    showToast.success("Algorithm state reset successfully");
  }, [onReset]);

  const hasContent = Boolean(
    algorithm.metadata.title ||
      algorithm.metadata.tags.length > 0 ||
      algorithm.description ||
      algorithm.files.length > 0
  );

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
                  <Label htmlFor="category" className="flex items-center gap-1">
                    Category
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={algorithm.metadata.category}
                    onValueChange={onCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithmCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="difficulty"
                    className="flex items-center gap-1"
                  >
                    Difficulty
                    <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="difficulty"
                    className="w-full p-2 rounded-md border dark:bg-background"
                    value={algorithm.metadata.difficulty}
                    onChange={(e) =>
                      onDifficultyChange(
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
                  value={algorithm.description}
                  onChange={onDescriptionChange}
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
