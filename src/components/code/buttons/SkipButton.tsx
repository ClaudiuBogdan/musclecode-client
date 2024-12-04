import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SkipButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SkipButton({ onClick, disabled, className }: SkipButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSkip = () => {
    if (!disabled) {
      onClick?.();
      setDropdownOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!disabled) {
      setDropdownOpen(open);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          className={`
            gap-2 min-w-[120px] font-medium
            ${className}
            ${
              disabled
                ? "text-gray-500 border-gray-700 bg-gray-800/50 cursor-not-allowed"
                : "text-yellow-400 hover:text-yellow-300 border-yellow-800/40 hover:border-yellow-700 bg-yellow-900/10 hover:bg-yellow-900/20"
            }
          `}
          variant="outline"
        >
          <ArrowRight className="h-4 w-4" />
          Skip
        </Button>
      </DropdownMenuTrigger>
      {!disabled && (
        <DropdownMenuContent
          className="w-56 bg-gray-800 border-gray-700 text-gray-200"
          align="end"
          alignOffset={-4}
        >
          <div className="px-2 py-2 text-sm text-gray-300">
            Are you sure you want to skip this problem?
          </div>
          <div className="flex border-t border-gray-700">
            <DropdownMenuItem
              className="flex-1 justify-center text-gray-300 hover:!bg-gray-700 hover:!text-gray-200 cursor-pointer"
              onClick={() => setDropdownOpen(false)}
            >
              No
            </DropdownMenuItem>
            <div className="w-px bg-gray-700" />
            <DropdownMenuItem
              className="flex-1 justify-center text-yellow-500 hover:!bg-gray-700 hover:!text-yellow-400 cursor-pointer"
              onClick={handleSkip}
            >
              Yes
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
