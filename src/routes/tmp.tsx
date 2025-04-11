import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/config/env";
import ChatInput from "@/components/canvas/chat-input";
export const Route = createFileRoute("/tmp")({
  component: RouteComponent,
});

function RouteComponent() {
  if (env.VITE_APP_ENVIRONMENT !== "development") {
    return null;
  }

  return (
    <div>
      <ChatInput />
    </div>
  );
}
