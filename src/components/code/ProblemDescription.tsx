
import { Markdown } from "@/components/ui/markdown";
import useNavigationStorage from "@/hooks/useNavigationStorage";

import { ProblemNavigation } from "./ProblemNavigation";

import type { AlgorithmLesson } from "@/types/algorithm";
import type { FC } from "react";

interface ProblemDescriptionProps {
  lessons: AlgorithmLesson[];
}

export const ProblemDescription: FC<ProblemDescriptionProps> = ({
  lessons,
}) => {
  const titles = lessons.map((item) => item.title);

  // Use a unique identifier for this set of lessons
  // We're using the first lesson title as part of the key to make it unique per problem
  const navigationKey = `problem_${lessons[0]?.title || "unknown"}`;

  const { currentStep, goToNext, goToPrevious, goToStep } =
    useNavigationStorage(navigationKey, titles.length);

  return (
    <div className="flex flex-col h-full relative">
      {/* Current Step Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-[2rem] mb-[2.25rem]">
        <Markdown content={lessons[currentStep].content} />
      </div>
      {/* Navigation fixed at the bottom */}
      <div className="absolute inset-x-0 bottom-0">
        <ProblemNavigation
          onNext={goToNext}
          onPrev={goToPrevious}
          onNavigate={goToStep}
          titles={titles}
          currIndex={currentStep}
        />
      </div>
    </div>
  );
};
