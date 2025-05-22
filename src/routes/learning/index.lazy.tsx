import { useNavigate } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/learning/")({
  component: LearningIndexPage,
});

function LearningIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to the modules page
    void navigate({ to: "/learning/modules" });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to modules...</p>
    </div>
  );
}
