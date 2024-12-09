import { useRouter } from "@tanstack/react-router";
import { RunButton } from "@/components/code/buttons/RunButton";
import { SkipButton } from "@/components/code/buttons/SkipButton";
import { ResetButton } from "@/components/code/buttons/ResetButton";
import { DifficultySelector } from "./DifficultySelector";
import NextButton from "../buttons/NextButton";

interface ButtonBarProps {
  algorithmId: string;
  nextAlgorithmId?: string;
  hasPassed: boolean;
  isExecuting: boolean;
  isSubmitting: boolean;
  isCompleted: boolean;
  onRun: () => void;
  onReset: () => void;
}

export const ButtonBar: React.FC<ButtonBarProps> = ({
  algorithmId,
  nextAlgorithmId,
  hasPassed,
  isExecuting,
  isSubmitting,
  isCompleted,
  onRun,
  onReset,
}) => {
  const router = useRouter();

  const handleSkip = () => {
    if (nextAlgorithmId) {
      router.navigate({
        to: "/algorithms/$algorithmId",
        params: { algorithmId: nextAlgorithmId },
      });
    } else {
      router.navigate({
        to: "/",
      });
    }
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="flex overflow-y-hidden items-center justify-start gap-4 px-3 py-1.5 border-t border-[#1E1E1E] bg-[#1E1E1E] shadow-[0_-1px_2px_rgba(0,0,0,0.2)]">
      <div className="flex justify-between w-full gap-3">
        {!isCompleted && (
          <RunButton
            onRun={onRun}
            isRunning={isExecuting}
            disabled={isExecuting || isSubmitting}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}
        {isCompleted && (
          <ResetButton
            onClick={handleReset}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}
        {!hasPassed && !!nextAlgorithmId && !isCompleted && (
          <SkipButton
            disabled={isExecuting}
            onClick={handleSkip}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}

        {isCompleted && (
          <NextButton
            disabled={isExecuting}
            onClick={handleSkip}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}
      </div>

      {hasPassed && !isCompleted && (
        <DifficultySelector
          algorithmId={algorithmId}
          nextAlgorithmId={nextAlgorithmId}
        />
      )}
    </div>
  );
};
