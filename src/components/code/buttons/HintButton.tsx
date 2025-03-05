import React from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";
import { posthog } from "posthog-js";
import { tracingStore } from "@/stores/tracing";
import { useHotkeys } from "react-hotkeys-hook";

const logger = createLogger({ context: "HintButton" });

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const HintButton: React.FC<HintButtonProps> = ({
  onClick,
  disabled = false,
  className = "",
}) => {
  const hintHotkey = "meta+e";
  const displayHotkey = navigator.platform.includes("Mac") ? "⌘+E" : "Ctrl+E";

  const handleHint = () => {
    const context = tracingStore.getState().getContext();
    logger.info("Hint button clicked");
    posthog.capture("Hint Button Clicked", {
      ...context,
    });

    onClick();
  };

  useHotkeys(
    hintHotkey,
    () => {
      logger.info("Hint hotkey pressed");
      posthog.capture("Hint Hotkey Pressed");
      onClick();
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

  return (
    <Button
      onClick={handleHint}
      disabled={disabled}
      className={`
        gap-2 min-w-[120px] font-medium relative
        ${className}
        text-yellow-400 hover:text-yellow-300 border-yellow-800/40 hover:border-yellow-700 bg-yellow-900/10 hover:bg-yellow-900/20
      `}
      variant="outline"
    >
      <Lightbulb className="h-4 w-4" />
      Hint
      <span className="ml-1 text-xs opacity-60 font-normal">
        {displayHotkey}
      </span>
    </Button>
  );
};
