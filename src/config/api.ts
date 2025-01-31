import { env } from "./env";

interface ApiConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

if (!env.VITE_OPENAI_API_URL) {
  throw new Error("VITE_OPENAI_API_URL environment variable is not set");
}

if (!env.VITE_OPENAI_API_KEY) {
  throw new Error("VITE_OPENAI_API_KEY environment variable is not set");
}

if (!env.VITE_OPENAI_MODEL) {
  throw new Error("VITE_OPENAI_MODEL environment variable is not set");
}

export const apiConfig: ApiConfig = {
  baseURL: env.VITE_OPENAI_API_URL,
  apiKey: env.VITE_OPENAI_API_KEY,
  model: env.VITE_OPENAI_MODEL,
};
