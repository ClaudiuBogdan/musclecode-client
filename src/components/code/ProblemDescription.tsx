import { FC } from 'react'
import { MDXContent } from "@/components/mdx/MDXContent";

interface ProblemDescriptionProps {
  problemDescription: string;
}

export const ProblemDescription: FC<ProblemDescriptionProps> = ({
  problemDescription,
}) => {
  return (
    <div className="p-4 overflow-auto">
      <MDXContent
        code={problemDescription}
        fallback={
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            Loading problem description...
          </div>
        }
      />
    </div>
  );
};
