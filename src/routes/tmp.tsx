import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/config/env";
import { Chat } from "@/components/canvas/chat/Chat";

export const Route = createFileRoute("/tmp")({
  component: RouteComponent,
});

function RouteComponent() {
  if (env.VITE_APP_ENVIRONMENT !== "development") {
    return null;
  }

  return <Chat />;
}
