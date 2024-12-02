import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../theme/theme-provider";

type Theme = "system" | "light" | "dark";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "system" as Theme, icon: Monitor, tooltip: "System" },
    { value: "light" as Theme, icon: Sun, tooltip: "Light" },
    { value: "dark" as Theme, icon: Moon, tooltip: "Dark" },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium">Theme</span>
        <div className="flex space-x-1">
          {options.map((option) => (
            <Tooltip key={option.value} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${theme === option.value ? "bg-muted" : ""}`}
                  onClick={() => setTheme(option.value)}
                >
                  <option.icon className="h-4 w-4" />
                  <span className="sr-only">{option.tooltip}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{option.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
