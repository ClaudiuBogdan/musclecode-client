import {
  createLazyFileRoute,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { AlgorithmForm } from "@/components/algorithms-editor/AlgorithmForm";
import { useAlgorithm } from "@/lib/api/algorithm";
import { useEditAlgorithmStore } from "@/stores/editAlgorithm";
import { useEffect, useCallback } from "react";
import { useAlgorithmValidation } from "@/hooks/useAlgorithmValidation";
import { showToast } from "@/utils/toast";

export const Route = createLazyFileRoute("/algorithms/$algorithmId/edit")({
  component: EditAlgorithm,
});

export default function EditAlgorithm() {
  const navigate = useNavigate();
  const { algorithmId } = useParams({
    from: "/algorithms/$algorithmId/edit",
  });

  const {
    data: existingAlgorithm,
    isLoading: isLoadingAlgorithm,
    error: loadError,
  } = useAlgorithm(algorithmId);

  const {
    algorithm,
    setTitle,
    setSummary,
    setCategory,
    setDifficulty,
    setTags,
    setDescription,
    addLanguage,
    addFiles: addFile,
    removeLanguage,
    updateFileContent,
    setAlgorithmId,
    isLoading: isSaving,
    error: saveError,
    saveAlgorithm,
    resetState,
  } = useEditAlgorithmStore();

  const validation = useAlgorithmValidation(algorithm);

  useEffect(() => {
    if (existingAlgorithm) {
      // TODO: this code needs refactoring. The logic is too complicated and error prone.
      // Set algorithm ID
      setAlgorithmId(algorithmId);

      // Set summary
      setSummary(existingAlgorithm.summary);

      // Set tags
      setTags(existingAlgorithm.tags);

      // Set category
      setCategory(existingAlgorithm.category);

      // Set metadata
      setTitle(existingAlgorithm.title);
      setDifficulty(existingAlgorithm.difficulty);

      // Set description
      setDescription(existingAlgorithm.description);

      addFile(existingAlgorithm.files);
    }
  }, [
    existingAlgorithm,
    algorithmId,
    setAlgorithmId,
    setTitle,
    setDifficulty,
    setTags,
    setDescription,
    addLanguage,
    addFile,
    setSummary,
    setCategory,
    resetState,
  ]);

  const handleSave = useCallback(async () => {
    try {
      await saveAlgorithm();
      showToast.success("Algorithm updated successfully!");
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

  if (isLoadingAlgorithm) return <div>Loading...</div>;
  if (loadError) return <div>Error loading algorithm: {loadError.message}</div>;
  if (!existingAlgorithm) return <div>Algorithm not found</div>;

  return (
    <AlgorithmForm
      mode="edit"
      algorithm={algorithm}
      isLoading={isSaving}
      error={saveError}
      validation={validation}
      onTitleChange={setTitle}
      onDifficultyChange={setDifficulty}
      onDescriptionChange={setDescription}
      onLanguageAdd={addLanguage}
      onLanguageRemove={removeLanguage}
      onFileContentChange={updateFileContent}
      onSave={handleSave}
      onReset={handleReset}
      onCancel={handleCancel}
      onSummaryChange={setSummary}
      onCategoryChange={setCategory}
      onTagsChange={setTags}
    />
  );
}
