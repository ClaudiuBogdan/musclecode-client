import { useRouter } from "@tanstack/react-router";
import { RunButton } from "@/components/code/RunButton";
import { SkipButton } from "@/components/code/SkipButton";
import { DifficultySelector } from "./DifficultySelector";

interface ButtonBarProps {
  algorithmId: string;
  nextAlgorithmId?: string;
  hasPassed: boolean;
  isExecuting: boolean;
  isSubmitting: boolean;
  onRun: () => void;
}

export const ButtonBar: React.FC<ButtonBarProps> = ({
  algorithmId,
  nextAlgorithmId,
  hasPassed,
  isExecuting,
  isSubmitting,
  onRun,
}) => {
  const router = useRouter();

  const handleSkip = () => {
    if (nextAlgorithmId) {
      router.navigate({
        to: "/algorithm/$id",
        params: { id: nextAlgorithmId },
      });
    }
  };

  return (
    <div className="flex overflow-y-hidden items-center justify-start gap-4 px-3 py-1.5 border-t border-[#1E1E1E] bg-[#1E1E1E] shadow-[0_-1px_2px_rgba(0,0,0,0.2)]">
      <div className="flex justify-between w-full gap-3">
        <RunButton
          onRun={onRun}
          isRunning={isExecuting}
          disabled={isExecuting || isSubmitting}
          className="hover:bg-[#2D2D2D] transition-colors duration-150"
        />
        {!hasPassed && !!nextAlgorithmId && (
          <SkipButton
            disabled={isExecuting}
            onClick={handleSkip}
            className="hover:bg-[#2D2D2D] transition-colors duration-150"
          />
        )}
      </div>

      {hasPassed && (
        <DifficultySelector
          algorithmId={algorithmId}
          nextAlgorithmId={nextAlgorithmId}
        />
      )}
    </div>
  );
};
