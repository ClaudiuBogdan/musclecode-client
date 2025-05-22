import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-red-500 dark:text-red-400 text-center">
        {message}
      </div>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          "Retry"
        )}
      </Button>
    </div>
  );
}
