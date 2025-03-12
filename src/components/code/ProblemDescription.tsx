import { FC, useState } from "react";
import { Markdown } from "@/components/ui/markdown";
import { AlgorithmLesson } from "@/types/algorithm";
import { ProblemNavigation } from "./ProblemNavigation";

interface ProblemDescriptionProps {
  lessons: AlgorithmLesson[];
}

export const ProblemDescription: FC<ProblemDescriptionProps> = ({ lessons }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const titles = lessons.map((item) => item.title);

  const handleNext = () => {
    if (currentStep < titles.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Current Step Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-[2rem] mb-[2.25rem]">
        <Markdown content={lessons[currentStep].content} />
      </div>
      {/* Navigation fixed at the bottom */}
      <div className="absolute inset-x-0 bottom-0">
        <ProblemNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          onNavigate={(index) => setCurrentStep(index)}
          titles={titles}
          currIndex={currentStep}
        />
      </div>
    </div>
  );
};
