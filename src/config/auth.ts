import { z } from "zod";

const authConfigSchema = z.object({
  enabled: z.boolean(),
  keycloak: z.object({
    url: z.string().url(),
    realm: z.string(),
    clientId: z.string(),
  }),
  publicPaths: z.array(z.string()),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

// Auth is disabled in development by default
export const authConfig = authConfigSchema.parse({
  enabled: import.meta.env.PROD || import.meta.env.VITE_AUTH_ENABLED === "true",
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  },
  publicPaths: ["/login", "/", "/about", "/unauthorized"],
});
