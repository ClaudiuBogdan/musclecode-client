import { useEffect, useState } from 'react';
import { formatTime } from '@/utils/time';
import { Timer as TimerIcon, Pause, Play, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TimerProps {
  algorithmId: string;
  timerState: {
    startTime: number | null;
    pausedAt: number | null;
    totalPausedTime: number;
    isRunning: boolean;
  } | null;
  onStart: (algorithmId: string) => void;
  onPause: (algorithmId: string) => void;
  onResume: (algorithmId: string) => void;
  onReset: (algorithmId: string) => void;
}

export function Timer({ 
  algorithmId,
  timerState,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!timerState?.startTime) {
      onStart(algorithmId);
      return;
    }

    if (timerState.startTime) {
      const initialElapsed = timerState.isRunning
        ? Date.now() - timerState.startTime - timerState.totalPausedTime
        : timerState.pausedAt! - timerState.startTime - timerState.totalPausedTime;
      setElapsed(initialElapsed);
    }

    if (!timerState.isRunning) {
      return;
    }

    const interval = setInterval(() => {
      if (timerState.startTime) {
        const now = Date.now();
        setElapsed(now - timerState.startTime - timerState.totalPausedTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState, algorithmId, onStart]);

  const handleReset = () => {
    onReset(algorithmId);
    setDropdownOpen(false);
  };

  const isPaused = timerState && !timerState.isRunning;

  return (
    <div className="flex items-center gap-2 px-3 h-9 border-l border-gray-700">
      <div className={cn(
        "flex items-center gap-1.5 transition-colors",
        isPaused && "animate-pulse-attention"
      )}>
        <TimerIcon className={cn(
          "w-4 h-4",
          isPaused ? "text-red-400" : "text-gray-400"
        )} />
        <span className={cn(
          "w-20 font-mono text-sm",
          isPaused ? "text-red-400" : "text-gray-200"
        )}>
          {formatTime(elapsed)}
        </span>
      </div>
      <div className="flex gap-0.5">
        {timerState?.isRunning ? (
          <button
            onClick={() => onPause(algorithmId)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onResume(algorithmId)}
            className={cn(
              "p-1.5 hover:bg-gray-700/50 rounded-md transition-colors",
              isPaused ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-gray-200"
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
            className="w-56" 
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