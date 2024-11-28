import { PlayIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface RunButtonProps {
  onRun: () => void;
  disabled: boolean;
  isRunning?: boolean;
  className?: string;
}

export function RunButton({
  onRun,
  disabled,
  isRunning,
  className,
}: RunButtonProps) {
  return (
    <Button
      onClick={onRun}
      disabled={disabled}
      className={`
        gap-2 min-w-[120px] font-medium relative
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
      Run
      {isRunning && (
        <Loader2Icon className="h-4 w-4 animate-spin text-gray-400 absolute right-2" />
      )}
    </Button>
  );
}
