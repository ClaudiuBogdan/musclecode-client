import { createFileRoute } from "@tanstack/react-router";
import { createRouteGuard } from "@/lib/auth/route-guard";

export const Route = createFileRoute("/settings/profile")({
  beforeLoad: createRouteGuard({ roles: ["user"] }),
});
