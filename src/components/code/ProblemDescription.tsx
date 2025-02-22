import { FC } from "react";
import { Markdown } from "@/components/ui/markdown";

interface ProblemDescriptionProps {
  problemDescription: string;
}

export const ProblemDescription: FC<ProblemDescriptionProps> = ({
  problemDescription,
}) => {
  return (
    <div className="p-4">
      <Markdown content={problemDescription} />
    </div>
  );
};
