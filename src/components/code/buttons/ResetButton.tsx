import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export const ResetButton: FC<Props> = ({ onClick, disabled, className }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleReset = () => {
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
          variant="outline"
          disabled={disabled}
          className={`
            gap-2 min-w-[120px] font-medium
            ${className}
            ${
              disabled
                ? "text-gray-500 border-gray-800"
                : "text-yellow-400 hover:text-yellow-300 border-yellow-800/40 hover:border-yellow-700 bg-yellow-900/10 hover:bg-yellow-900/20"
            }
          `}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </DropdownMenuTrigger>
      {!disabled && (
        <DropdownMenuContent
          className="w-56 bg-gray-800 border-gray-700 text-gray-200"
          align="end"
          alignOffset={-4}
        >
          <div className="px-2 py-2 text-sm text-gray-300">
            Are you sure you want to reset your code?
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
              onClick={handleReset}
            >
              Yes
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
