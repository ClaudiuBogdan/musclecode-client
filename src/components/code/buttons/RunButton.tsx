import { PlayIcon } from "@radix-ui/react-icons";
import { posthog } from "posthog-js";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";
import { tracingStore } from "@/stores/tracing";


const logger = createLogger({ context: "RunButton" });

interface RunButtonProps {
  onRun: () => void;
  disabled: boolean;
  className?: string;
}

export function RunButton({ onRun, disabled, className }: RunButtonProps) {
  const runHotkey = "meta+r";
  const displayHotkey = navigator.platform.includes("Mac") ? "⌘+R" : "Ctrl+R";

  const handleRun = () => {
    const context = tracingStore.getState().getContext();
    logger.info("Run button clicked");
    posthog.capture("Run Button Clicked", {
      ...context,
    });

    onRun();
  };

  useHotkeys(
    runHotkey,
    () => {
      logger.info("Run hotkey pressed");
      posthog.capture("Run Hotkey Pressed");
      onRun();
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

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
      <span className="ml-1 text-xs opacity-60 font-normal">
        {displayHotkey}
      </span>
    </Button>
  );
}
