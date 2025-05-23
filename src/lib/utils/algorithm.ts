import type { CodeLanguage } from "@/types/algorithm";

export function getLanguageExtension(language: CodeLanguage): string {
  switch (language) {
    case "typescript":
      return "ts";
    case "python":
      return "py";
    case "javascript":
      return "js";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    case "go":
      return "go";
    default:
      throw new Error(`Unsupported language: ${language as string}`);
  }
}
