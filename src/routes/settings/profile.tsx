import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/profile")({
  // beforeLoad: createRouteGuard({ roles: ["user"] }),
});
