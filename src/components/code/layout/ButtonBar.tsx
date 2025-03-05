import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { RunButton } from "@/components/code/buttons/RunButton";
import { SkipButton } from "@/components/code/buttons/SkipButton";
import { HintButton } from "@/components/code/buttons/HintButton";
import { HintDisplay } from "@/components/code/hints/HintDisplay";
import { DifficultySelector } from "./DifficultySelector";
import { RatingSchedule } from "@/types/algorithm";
import { useAlgorithmStore } from "@/stores/algorithm";

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
  const [showHint, setShowHint] = useState(false);

  // Hint related selectors and actions
  const { requestHint, clearHint } = useAlgorithmStore();
  const hintState = useAlgorithmStore(
    (state) => state.algorithms[algorithmId]?.hint
  );

  const hintContent = hintState?.content;
  const isHintLoading = hintState?.isLoading || false;
  const hintError = hintState?.error;

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
  
  const handleHintRequest = () => {
    setShowHint(true);
    requestHint(algorithmId);
  };

  const handleHintClose = () => {
    setShowHint(false);
    clearHint(algorithmId);
  };

  return (
    <div className="flex overflow-y-hidden items-center justify-start gap-4 px-3 py-2 border-t border-[#1E1E1E] bg-[#1E1E1E] shadow-[0_-1px_2px_rgba(0,0,0,0.2)]">
      <div className="flex justify-between w-full gap-3">
        <div className="flex gap-3">
          <RunButton
            onRun={onRun}
            disabled={isExecuting || isSubmitting}
            className="transition-colors duration-150"
          />
          <HintButton
            onClick={handleHintRequest}
            disabled={isExecuting || isSubmitting || isHintLoading}
            className="transition-colors duration-150"
          />
        </div>
        <div className="flex gap-2">
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

      {showHint && (
        <div className="absolute bottom-16 left-4 z-10 w-96">
          <HintDisplay
            content={hintContent}
            isLoading={isHintLoading}
            error={hintError}
            onClose={handleHintClose}
          />
        </div>
      )}
    </div>
  );
};
