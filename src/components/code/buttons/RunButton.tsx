import { PlayIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ context: "RunButton" });

interface RunButtonProps {
  onRun: () => void;
  disabled: boolean;
  className?: string;
}

export function RunButton({ onRun, disabled, className }: RunButtonProps) {
  const handleRun = () => {
    logger.info("Run button clicked");
    onRun();
  };

  return (
    <Button
      onClick={handleRun}
      disabled={disabled}
      className={`
        gap-2 min-w-[120px] font-medium relative
        ${className}
        text-green-400 hover:text-green-300 border-green-800/40 hover:border-green-700 bg-green-900/10 hover:bg-green-900/20
      `}
      variant="outline"
    >
      <PlayIcon className="h-4 w-4" />
      Run
    </Button>
  );
}
