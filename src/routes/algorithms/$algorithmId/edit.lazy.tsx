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
import { v4 as uuidv4 } from "uuid";
import { CodeLanguage } from "@/types/algorithm";

export const Route = createLazyFileRoute("/algorithms/$algorithmId/edit")({
  component: EditAlgorithm,
});

export default function EditAlgorithm() {
  const navigate = useNavigate();
  const { algorithmId } = useParams({
    from: "/algorithms/$algorithmId/edit",
  });

  const {
    data,
    isLoading: isLoadingAlgorithm,
    error: loadError,
  } = useAlgorithm(algorithmId);
  const existingAlgorithm = data?.algorithm;

  const {
    algorithm,
    setTitle,
    setDifficulty,
    setTags,
    setDescription,
    addLanguage,
    removeLanguage,
    updateSolutionFile,
    updateTestFile,
    setAlgorithmId,
    isLoading: isSaving,
    error: saveError,
    saveAlgorithm,
    resetState,
  } = useEditAlgorithmStore();

  const validation = useAlgorithmValidation(algorithm);

  useEffect(() => {
    console.log("existingAlgorithm", existingAlgorithm);
    if (existingAlgorithm) {
      // Set algorithm ID
      setAlgorithmId(algorithmId);

      // Set metadata
      setTitle(existingAlgorithm.title);
      setDifficulty(existingAlgorithm.difficulty);

      // Set description
      setDescription(existingAlgorithm.description);

      // Set languages
      Object.entries(existingAlgorithm.files).forEach(([language, files]) => {
        const mainFile = files.find((f) => f.isMain);
        const testFile = files.find((f) => !f.isMain);

        if (mainFile && testFile) {
          const languageId = uuidv4();
          addLanguage(language as CodeLanguage);
          updateSolutionFile(languageId, mainFile.content);
          updateTestFile(languageId, testFile.content);
        }
      });
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
    updateSolutionFile,
    updateTestFile,
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
      onTagsChange={setTags}
      onDescriptionChange={setDescription}
      onLanguageAdd={addLanguage}
      onLanguageRemove={removeLanguage}
      onSolutionFileChange={updateSolutionFile}
      onTestFileChange={updateTestFile}
      onSave={handleSave}
      onReset={handleReset}
      onCancel={handleCancel}
    />
  );
}
