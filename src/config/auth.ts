import { z } from "zod";
import { env } from "./env";

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
  enabled: !env.VITE_DEV || env.VITE_AUTH_ENABLED,
  keycloak: {
    url: env.VITE_KEYCLOAK_URL,
    realm: env.VITE_KEYCLOAK_REALM,
    clientId: env.VITE_KEYCLOAK_CLIENT_ID,
  },
  publicPaths: ["/login", "/", "/about", "/unauthorized"],
});
