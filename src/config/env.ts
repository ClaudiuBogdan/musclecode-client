import { z } from "zod";

const envSchema = z.object({
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
    .transform((val) => val === "true"),
  VITE_AUTH_ENABLED: z
    .enum(["true", "false"])
    .transform((val) => val === "true"),
  VITE_DEV: z.boolean(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(env);
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
