import { PlayIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

interface RunButtonProps {
  onRun: () => void;
  isRunning: boolean;
  className?: string;
}

export function RunButton({ onRun, isRunning, className }: RunButtonProps) {
  return (
    <Button
      onClick={onRun}
      disabled={isRunning}
      className={`
        gap-2 min-w-[120px] font-medium
        ${className}
        ${
          isRunning
            ? "text-green-400 border-green-700 bg-green-900/20"
            : "text-green-400 hover:text-green-300 border-green-800/40 hover:border-green-700 bg-green-900/10 hover:bg-green-900/20"
        }
      `}
      variant="outline"
    >
      <PlayIcon className={`h-4 w-4 ${isRunning ? "animate-pulse" : ""}`} />
      {isRunning ? "Running..." : "Run"}
    </Button>
  );
}