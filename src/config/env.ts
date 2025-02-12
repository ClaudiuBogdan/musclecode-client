import { z } from "zod";

const envSchema = z.object({
  VITE_APP_VERSION: z.string().min(1),
  VITE_APP_NAME: z.string().min(1),
  VITE_APP_ENVIRONMENT: z.string().min(1),

  // API Configuration
  VITE_OPENAI_API_URL: z.string().url(),
  VITE_OPENAI_API_KEY: z.string().min(1),
  VITE_OPENAI_MODEL: z.string().min(1),
  VITE_API_URL: z.string().url(),
  VITE_EXECUTION_API_URL: z.string().url(),

  // Auth Configuration
  VITE_ENCRYPTION_KEY: z.string().min(1),
  VITE_KEYCLOAK_URL: z.string().url(),
  VITE_KEYCLOAK_REALM: z.string().min(1),
  VITE_KEYCLOAK_CLIENT_ID: z.string().min(1),
  VITE_USE_MOCK_AUTH: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  VITE_AUTH_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),

  // Telemetry Configuration
  VITE_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  VITE_LOG_ENDPOINT: z.string().url(),
  VITE_TRACE_ENDPOINT: z.string().url(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production"])
    .optional()
    .default("production"),

  // PostHog
  VITE_POSTHOG_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  VITE_POSTHOG_API_KEY: z.string().min(1).optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
  VITE_POSTHOG_PERSON_PROFILES: z
    .enum(["identified_only", "always"])
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      ...import.meta.env,
      MODE: import.meta.env.MODE,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        return `${issue.path.join(".")}: ${issue.message}`;
      });
      throw new Error(`Environment validation failed:\n${issues.join("\n")}`);
    }
    throw error;
  }
}

export const env = validateEnv();
