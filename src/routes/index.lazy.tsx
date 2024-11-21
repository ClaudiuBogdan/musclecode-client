import StartTraining from "@/components/training/StartTraining";
import { createLazyFileRoute } from "@tanstack/react-router";
import {AlgorithmsTable} from "@/components/algorithms/index";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 flex flex-col gap-4">
      <StartTraining />
      <AlgorithmsTable />
    </div>
  );
}
