import { useEffect, useState, useMemo, useCallback } from "react";
import { formatTime } from "@/utils/time";
import { Timer as TimerIcon, Pause, Play, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAlgorithmStore } from "@/stores/algorithm";
import { selectTimerState, selectIsPaused } from "@/stores/algorithm/selectors";

interface TimerProps {
  algorithmId: string;
  className?: string;
}

export function Timer({ algorithmId, className }: TimerProps) {
  const timerState = useAlgorithmStore(
    useCallback((state) => selectTimerState(state, algorithmId), [algorithmId])
  );
  const isPaused = useAlgorithmStore(
    useCallback((state) => selectIsPaused(state, algorithmId), [algorithmId])
  );

  const {
    startTimer,
    resumeTimer,
    pauseTimer,
    resetTimer,
    getTotalRunningTime,
  } = useAlgorithmStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);

  // Cache the initial running time
  const initialRunningTime = useMemo(
    () => getTotalRunningTime(algorithmId),
    [getTotalRunningTime, algorithmId]
  );

  useEffect(() => {
    if (!timerState) {
      startTimer(algorithmId);
      return;
    }

    setElapsed(initialRunningTime);

    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      const runningTime = getTotalRunningTime(algorithmId);
      setElapsed(runningTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timerState,
    isPaused,
    algorithmId,
    startTimer,
    getTotalRunningTime,
    initialRunningTime,
  ]);

  const handleReset = useCallback(() => {
    resetTimer(algorithmId);
    setDropdownOpen(false);
  }, [algorithmId, resetTimer]);

  const handlePause = useCallback(() => {
    pauseTimer(algorithmId);
  }, [algorithmId, pauseTimer]);

  const handleResume = useCallback(() => {
    resumeTimer(algorithmId);
  }, [algorithmId, resumeTimer]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 h-9 border-l border-gray-700",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          isPaused && "animate-pulse-attention"
        )}
      >
        <TimerIcon
          className={cn("w-4 h-4", isPaused ? "text-red-400" : "text-gray-400")}
        />
        <span
          className={cn(
            "w-20 font-mono text-sm",
            isPaused ? "text-red-400" : "text-gray-200"
          )}
        >
          {formatTime(elapsed)}
        </span>
      </div>
      <div className="flex gap-0.5">
        {!isPaused ? (
          <button
            onClick={handlePause}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleResume}
            className={cn(
              "p-1.5 hover:bg-gray-700/50 rounded-md transition-colors",
              isPaused
                ? "text-red-400 hover:text-red-300"
                : "text-gray-400 hover:text-gray-200"
            )}
            title="Resume"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-gray-800 border-gray-700 text-gray-200"
            align="end"
            alignOffset={-4}
          >
            <div className="px-2 py-2 text-sm text-gray-300">
              Are you sure you want to reset the timer?
            </div>
            <div className="flex border-t border-gray-700">
              <DropdownMenuItem
                className="flex-1 justify-center text-gray-300 hover:!text-gray-200 cursor-pointer"
                onClick={() => setDropdownOpen(false)}
              >
                No
              </DropdownMenuItem>
              <div className="w-px bg-gray-700" />
              <DropdownMenuItem
                className="flex-1 justify-center text-red-500 hover:!text-red-400 cursor-pointer"
                onClick={handleReset}
              >
                Yes
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
