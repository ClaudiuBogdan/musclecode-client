import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/config/env";
import ChatSession from "@/components/canvas/chat-session";

export const Route = createFileRoute("/tmp")({
  component: RouteComponent,
});

function RouteComponent() {
  if (env.VITE_APP_ENVIRONMENT !== "development") {
    return null;
  }

  return (
    <div>
      <ChatSession />
    </div>
  );
}
