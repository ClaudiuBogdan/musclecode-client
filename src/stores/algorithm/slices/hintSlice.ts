import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { AlgorithmState, HintActions, StoreActions } from "../types";
import { showToast } from "@/utils/toast";
import useChatStore from "@/stores/chat";
import { AlgorithmFile } from "@/types/algorithm";
import { ContextFile, MessageStreamDto } from "@/types/chat";
import { CodeExecutionResponse } from "@/types/testRunner";

export const createHintSlice: StateCreator<
  AlgorithmState & StoreActions,
  [["zustand/immer", never], ["zustand/persist", unknown]],
  [],
  HintActions
> = (set, get) => ({
  requestHint: async (algorithmId: string) => {
    try {
      const algorithmData = get().algorithms[algorithmId];

      if (!algorithmData) {
        showToast.error("Algorithm not found");
        return;
      }

      // Set loading state
      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = true;
          state.algorithms[algorithmId].hint.error = null;
        }
      });

      // Get all the context needed for a good hint
      const { code, execution, metadata } = algorithmData;
      const { storedCode, activeLanguage } = code;
      const { executionResult } = execution;
      const algorithmTemplate = metadata.template;

      if (!algorithmTemplate) {
        throw new Error("Algorithm template not found");
      }

      // Get all the files for the current language
      const languageFiles = storedCode[activeLanguage] || {};

      // Find the test file and solution file (if any)
      const testFile = Object.values(languageFiles).find(
        (file) => file.type === "test"
      );

      const exerciseFile = Object.values(languageFiles).find(
        (file) => file.type === "exercise"
      );

      if (!exerciseFile) {
        throw new Error("Exercise file not found");
      }

      // Generate the hint
      const message = generateHintMessage({
        exerciseFile,
        testFile,
        executionResult,
      });

      const hint = await useChatStore.getState().sendHintMessage(message);

      // Update state with the hint
      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = false;
          state.algorithms[algorithmId].hint.content = hint;
          state.algorithms[algorithmId].hint.lastRequestTime = Date.now();
        }
      });
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate hint";

      set((state) => {
        if (state.algorithms[algorithmId]) {
          state.algorithms[algorithmId].hint.isLoading = false;
          state.algorithms[algorithmId].hint.error = errorMessage;
        }
      });

      showToast.error("Failed to generate hint: " + errorMessage);
    }
  },

  clearHint: (algorithmId: string) => {
    set((state) => {
      if (state.algorithms[algorithmId]) {
        state.algorithms[algorithmId].hint.content = null;
        state.algorithms[algorithmId].hint.error = null;
        state.algorithms[algorithmId].hint.isLoading = false;
      }
    });
  },
});

function generateHintMessage(context: {
  exerciseFile: AlgorithmFile;
  testFile?: AlgorithmFile;
  executionResult?: CodeExecutionResponse | null;
}): MessageStreamDto {
  const files: ContextFile[] = [];

  if (context.exerciseFile) {
    files.push({
      name: context.exerciseFile.name,
      content: context.exerciseFile.content,
      description: "## This is the exercise file",
    });
  }

  if (context.testFile) {
    files.push({
      name: context.testFile.name,
      content: context.testFile.content,
      description: "## This is the test file",
    });
  }

  if (context.executionResult) {
    files.push({
      name: "execution-result.txt",
      content: JSON.stringify(context.executionResult, null, 2),
      description: "## This is the execution result",
    });
  }

  return {
    messageId: uuidv4(),
    assistantMessageId: uuidv4(),
    threadId: "", // Thread id placeholder. The thread id is injected in the chat store.
    algorithmId: "", // Algorithm id placeholder. The algorithm id is injected in the chat store.
    parentId: null, // Parent id placeholder. The parent id is injected in the chat store.
    type: "hint",
    content: "",
    context: {
      prompt: "hint-prompt",
      files,
    },
  };
}
