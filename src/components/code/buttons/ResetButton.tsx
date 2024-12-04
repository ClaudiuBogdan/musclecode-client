import { Button } from "@/components/ui/button";
import { FC } from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export const ResetButton: FC<Props> = ({ onClick, disabled, className }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
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
  );
};
