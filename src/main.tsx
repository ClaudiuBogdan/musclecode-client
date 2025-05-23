import { RouterProvider, createRouter } from "@tanstack/react-router";
import { PostHogProvider } from "posthog-js/react";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css";
import "./lib/tracing/tracer";

// Import the generated route tree
import { env } from "./config/env";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Initialize MSW and then render the app
const root = document.getElementById("root")!;
if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <PostHogProvider
      apiKey={env.VITE_POSTHOG_API_KEY ?? ""}
      options={
        env.VITE_POSTHOG_ENABLED
          ? {
            api_host: env.VITE_POSTHOG_HOST,
            person_profiles: env.VITE_POSTHOG_PERSON_PROFILES,
          }
          : undefined
      }
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </StrictMode>
);
