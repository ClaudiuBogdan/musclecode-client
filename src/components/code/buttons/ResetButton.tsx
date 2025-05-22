import { RotateCcw, File } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { FC} from "react";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ResetButton: FC<Props> = ({ onClick, disabled, className }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleReset = () => {
    if (!disabled) {
      onClick?.();
      setDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={(open) => !disabled && setDropdownOpen(open)}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-9 px-2.5 gap-1.5 text-sm font-normal text-gray-300 hover:text-gray-100",
            "hover:bg-[#2D2D2D] transition-colors duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300",
            className
          )}
        >
          <File className="h-4 w-4 text-yellow-500" />
          <span>Reset</span>
          <RotateCcw className="h-4 w-4 text-yellow-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-gray-800 border-gray-700 text-gray-200"
        align="end"
      >
        <div className="px-2 py-2 text-sm text-gray-300">
          Reset code to initial state?
        </div>
        <div className="flex border-t border-gray-700 mt-2 pt-2">
          <DropdownMenuItem
            className="flex-1 justify-center text-gray-300 hover:bg-gray-700 cursor-pointer"
            onClick={() => setDropdownOpen(false)}
          >
            Cancel
          </DropdownMenuItem>
          <button
            onClick={handleReset}
            className="flex-1 justify-center text-yellow-400 hover:bg-gray-700 px-4 py-1.5 text-sm cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
