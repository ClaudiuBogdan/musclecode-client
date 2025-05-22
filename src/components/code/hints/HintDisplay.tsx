import { X } from "lucide-react";
import { Lightbulb } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";


interface HintDisplayProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onChatFocus?: () => void;
}

export const HintDisplay: React.FC<HintDisplayProps> = ({
  content,
  isLoading,
  error,
  onClose,
  onChatFocus,
}) => {
  if (!isLoading && !content && !error) {
    return null;
  }

  return (
    <Card className="w-full max-w-md bg-yellow-950/20 border border-yellow-900/50 text-white shadow-lg animate-in fade-in-50 bg-black">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center text-yellow-400">
            <Lightbulb className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Hint</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/40"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="mt-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
              <p className="text-sm text-gray-300">Thinking of a hint...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">
              <p>Error: {error}</p>
              <p className="mt-1">Please try again.</p>
            </div>
          )}

          {content && !isLoading && !error && (
            <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </CardContent>

      {content && !isLoading && !error && (
        <CardFooter className="pt-0 pb-4 text-xs text-gray-400">
          Apply this hint and try again!
          {onChatFocus && (
            <Button variant="link" size="sm" onClick={onChatFocus}>
              Ask a question
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
