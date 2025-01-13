interface ApiConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

if (!import.meta.env.VITE_OPENAI_API_URL) {
  throw new Error("VITE_OPENAI_API_URL environment variable is not set");
}

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error("VITE_OPENAI_API_KEY environment variable is not set");
}

if (!import.meta.env.VITE_OPENAI_MODEL) {
  throw new Error("VITE_OPENAI_MODEL environment variable is not set");
}

export const apiConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_OPENAI_API_URL,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: import.meta.env.VITE_OPENAI_MODEL,
};
