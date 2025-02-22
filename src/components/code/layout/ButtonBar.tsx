import { useRouter } from "@tanstack/react-router";
import { RunButton } from "@/components/code/buttons/RunButton";
import { SkipButton } from "@/components/code/buttons/SkipButton";
import { ResetButton } from "@/components/code/buttons/ResetButton";
import { DifficultySelector } from "./DifficultySelector";
import { RatingSchedule } from "@/types/algorithm";
import { useCodeComparison } from "@/hooks/useCodeComparison";

interface ButtonBarProps {
  algorithmId: string;
  nextAlgorithmId?: string;
  hasPassed: boolean;
  isExecuting: boolean;
  isSubmitting: boolean;
  ratingSchedule: RatingSchedule | null;
  onRun: () => void;
  onReset: () => void;
}

export const ButtonBar: React.FC<ButtonBarProps> = ({
  algorithmId,
  nextAlgorithmId,
  hasPassed,
  isExecuting,
  isSubmitting,
  ratingSchedule,
  onRun,
  onReset,
}) => {
  const router = useRouter();
  const hasCodeChanges = useCodeComparison(algorithmId);

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
        {!hasPassed && (
          <RunButton
            onRun={onRun}
            disabled={isExecuting || isSubmitting}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}
        <div className="flex gap-2">
          {hasCodeChanges && (
            <ResetButton
              disabled={isExecuting || isSubmitting}
              onClick={handleReset}
              className="hover:bg-[#2D2D2D] transition-colors duration-150"
            />
          )}
          {!hasPassed && !!nextAlgorithmId && (
            <SkipButton
              disabled={isExecuting}
              onClick={handleSkip}
              className="hover:bg-[#2D2D2D] transition-colors duration-150"
            />
          )}
        </div>
      </div>

      {hasPassed && ratingSchedule && (
        <DifficultySelector
          onReset={handleReset}
          algorithmId={algorithmId}
          nextAlgorithmId={nextAlgorithmId}
          ratingSchedule={ratingSchedule}
        />
      )}
    </div>
  );
};
