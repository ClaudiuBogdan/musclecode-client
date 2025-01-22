import { Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({ message = "Loading..." }: AuthLoadingProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg text-muted-foreground">{message}</div>
      </div>
    </div>
  );
}
