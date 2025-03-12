import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AlgorithmForm } from "@/components/algorithms-editor/AlgorithmForm";
import { useNewAlgorithmStore } from "@/stores/newAlgorithm";
import { useCallback } from "react";
import { useAlgorithmValidation } from "@/hooks/useAlgorithmValidation";
import { showToast } from "@/utils/toast";

export const Route = createLazyFileRoute("/algorithms/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    algorithm,
    isLoading,
    error,
    setTitle,
    setDifficulty,
    setSummary,
    setCategories: setCategory,
    setTags,
    addLesson,
    updateLesson,
    removeLesson,
    addLanguage,
    removeLanguage,
    updateFileContent,
    saveAlgorithm,
    resetState,
  } = useNewAlgorithmStore();

  const validation = useAlgorithmValidation(algorithm);

  const handleSave = useCallback(async () => {
    try {
      await saveAlgorithm();
      showToast.success("Algorithm created successfully!");
      navigate({ to: "/algorithms" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save algorithm";
      showToast.error(errorMessage);
    }
  }, [saveAlgorithm, navigate]);

  const handleReset = useCallback(() => {
    resetState();
    showToast.success("Algorithm state reset successfully");
  }, [resetState]);

  const handleCancel = useCallback(() => {
    navigate({ to: "/algorithms" });
  }, [navigate]);

  return (
    <AlgorithmForm
      mode="new"
      algorithm={algorithm}
      isLoading={isLoading}
      error={error}
      validation={validation}
      onTitleChange={setTitle}
      onDifficultyChange={setDifficulty}
      onSummaryChange={setSummary}
      onCategoriesChange={setCategory}
      onTagsChange={setTags}
      onLessonAdd={addLesson}
      onLessonUpdate={updateLesson}
      onLessonRemove={removeLesson}
      onLanguageAdd={addLanguage}
      onLanguageRemove={removeLanguage}
      onFileContentChange={updateFileContent}
      onSave={handleSave}
      onReset={handleReset}
      onCancel={handleCancel}
    />
  );
}
