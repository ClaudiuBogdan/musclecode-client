import StartTraining from "@/components/training/StartTraining";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="mt-12 p-2 flex flex-col gap-4">
      <StartTraining />
    </div>
  );
}
