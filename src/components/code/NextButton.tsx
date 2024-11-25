import { Button } from "@/components/ui/button";
import { FC } from "react";
import { ArrowRight } from "lucide-react";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
};

const NextButton: FC<Props> = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`
        gap-2 min-w-[120px] font-medium
        ${
          disabled
            ? "text-gray-500 border-gray-800"
            : "text-green-400 hover:text-green-300 border-green-800/40 hover:border-green-700 bg-green-900/10 hover:bg-green-900/20"
        }
      `}
    >
      <ArrowRight className="h-4 w-4" />
      Next
    </Button>
  );
};

export default NextButton;
