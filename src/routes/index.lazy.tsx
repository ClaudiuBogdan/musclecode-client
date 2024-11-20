import StartTraining from "@/components/training/StartTraining";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <StartTraining />
    </div>
  );
}
