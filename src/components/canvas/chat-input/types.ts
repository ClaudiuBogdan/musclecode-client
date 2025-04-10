import {
  CanvasContext,
  ContextReference,
  KeyValueContextElement,
  PromptReferenceContext,
} from "../chat/types";

// Standard context options
const promptContext: PromptReferenceContext = {
  id: "1",
  type: "prompt",
  prompt: {
    id: "1",
    name: "Prompt 1",
    description: "Prompt 1 description",
  },
  unique: true,
};

const canvasContext: CanvasContext = {
  id: "2",
  type: "canvas",
  canvas: {
    id: "2",
    name: "Canvas 2",
    description: "Canvas 2 description",
  },
};

// Difficulty section
const difficultyContext: KeyValueContextElement = {
  id: "3",
  type: "key_value",
  title: "Difficulty",
  key_value: {
    key: "difficulty",
    value: "easy",
    options: ["easy", "medium", "hard"],
    customValue: true,
    description: "The difficulty of the task",
    unique: true,
  },
};

// Language section
const languageContext: KeyValueContextElement = {
  id: "4",
  type: "key_value",
  title: "Language",
  key_value: {
    key: "language",
    value: "javascript",
    options: ["javascript", "typescript", "python", "java", "go", "rust"],
    customValue: true,
    description: "Programming language to use",
    unique: true,
  },
};

// Mode section
const modeContext: KeyValueContextElement = {
  id: "5",
  type: "key_value",
  title: "Mode",
  key_value: {
    key: "mode",
    value: "basic",
    options: ["basic", "advanced", "expert"],
    customValue: false,
    description: "Interaction mode",
    unique: true,
  },
};

// Collection of available context options
export const contextOptions: ContextReference[] = [
  promptContext,
  canvasContext,
  difficultyContext,
  languageContext,
  modeContext,
];

// Helper to get display name for a context element
export const getContextDisplayName = (context: ContextReference): string => {
  switch (context.type) {
    case "prompt":
      return context.prompt.name;
    case "canvas":
      return context.canvas.name;
    case "key_value":
      return `${context.key_value.key}:${context.key_value.value}`;
  }
};

// Helper to get context description
export const getContextDescription = (
  context: ContextReference
): string | undefined => {
  switch (context.type) {
    case "prompt":
      return context.prompt.description;
    case "canvas":
      return context.canvas.description;
    case "key_value":
      return context.key_value.description;
  }
};

// Helper to get context section title
export const getContextSectionTitle = (context: ContextReference): string => {
  if (context.type === "key_value" && context.title) {
    return context.title;
  }
  return context.type.charAt(0).toUpperCase() + context.type.slice(1);
};

// Helper to get context kind for grouping
export const getContextKind = (context: ContextReference): string => {
  if (context.type === "key_value" && context.title) {
    return context.title;
  }
  return context.type;
};

// Helper to update value for key-value context
export const updateKeyValueContextValue = (
  context: KeyValueContextElement,
  newValue: string
): KeyValueContextElement => {
  return {
    ...context,
    key_value: {
      ...context.key_value,
      value: newValue,
    },
  };
};

// Helper to check if a context is unique
export const isContextUnique = (context: ContextReference): boolean => {
  return (
    context.unique === true ||
    (context.type === "key_value" && context.key_value.unique === true)
  );
};

// Helper to check if contexts should replace each other
export const shouldReplaceContext = (
  existing: ContextReference,
  incoming: ContextReference
): boolean => {
  // If the incoming one is unique, check if existing one should be replaced
  if (isContextUnique(incoming)) {
    // For key_value, check the key
    if (incoming.type === "key_value" && existing.type === "key_value") {
      return incoming.key_value.key === existing.key_value.key;
    }
    // Otherwise check the type
    return incoming.type === existing.type && isContextUnique(existing);
  }
  return false;
};
