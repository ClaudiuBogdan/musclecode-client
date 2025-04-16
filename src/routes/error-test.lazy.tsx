import { createLazyFileRoute } from "@tanstack/react-router";
import { ErrorTestPage } from "@/components/canvas/chat/ErrorTestPage";

export const Route = createLazyFileRoute("/error-test")({
  component: ErrorTestPage,
});
