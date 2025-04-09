import { createLazyFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/learning/")({
  component: LearningLayout,
});

function LearningLayout() {
  return (
    <div className="container mx-auto py-4">
      <Outlet />
    </div>
  );
}
