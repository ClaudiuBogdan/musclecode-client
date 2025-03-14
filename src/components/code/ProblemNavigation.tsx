import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProblemNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  onNavigate: (index: number) => void;
  titles: string[];
  currIndex: number;
}

export const ProblemNavigation = ({
  onNext,
  onPrev,
  onNavigate,
  titles,
  currIndex,
}: ProblemNavigationProps) => {
  const hasPrev = currIndex > 0;
  const hasNext = currIndex < titles.length - 1;
  const progress = ((currIndex + 1) / titles.length) * 100;

  return (
    <div className="flex flex-col pb-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 p-0">
      {/* Subtle Progress Bar */}
      <div className="h-1 bg-muted/20 rounded-full">
        <motion.div
          className="h-full bg-primary/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-0 m-0">
        {/* Previous Button */}
        <motion.div animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            disabled={!hasPrev}
            className="h-12 w-12 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-0 shadow-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </motion.div>

        {/* Table of Contents Dropdown Component */}
        <TableOfContentsDropdown
          titles={titles}
          currIndex={currIndex}
          onNavigate={onNavigate}
        />

        {/* Step Indicator */}
        <Button
          variant="ghost"
          size="sm"
          onClick={hasNext ? onNext : undefined}
          disabled={!hasNext}
          className="flex-1 h-12 border-0 px-3 text-left text-xl py-4 truncate hover:bg-accent/50 dark:hover:bg-accent/100 active:scale-[0.98] transition-transform justify-start bg-white dark:bg-gray-900 cursor-pointer"
        >
          <span className="text-muted-foreground/80 text-sm">Next:</span>{" "}
          <span className="text-foreground text-lg">
            {hasNext ? titles[currIndex + 1] : "All steps completed"}
          </span>
        </Button>

        {/* Next Button */}
        <motion.div
          animate={{ opacity: hasNext ? 1 : 0.8 }}
          className={!hasNext ? "pointer-events-auto" : ""}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={!hasNext}
            className="h-12 w-12 border-0 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-0 shadow-none"
          >
            {hasNext ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// New component for the dropdown (Table of Contents)
const TableOfContentsDropdown = ({
  titles,
  currIndex,
  onNavigate,
}: {
  titles: string[];
  currIndex: number;
  onNavigate: (index: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 bg-white border-0 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-0 shadow-none"
        >
          <Table className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="w-full max-w-[32rem] max-h-[70vh] overflow-y-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
      >
        <div className="p-2">
          <h3 className="text-lg font-semibold text-foreground/80 px-2 mb-2">
            Table of Contents
          </h3>
          {titles.map((title, index) => (
            <DropdownMenuItem
              key={index}
              onSelect={() => {
                onNavigate(index);
                setIsOpen(false);
              }}
              className={`
                    group rounded-md p-2 text-xs
                    ${
                      index === currIndex
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent/30"
                    }
                    transition-colors cursor-pointer
                  `}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`flex-none w-5 h-5 flex items-center justify-center
                        ${
                          index === currIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground/50 group-hover:bg-accent"
                        }
                        rounded-full text-lg transition-colors`}
                >
                  {index === currIndex ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="flex-1 truncate">{title}</span>

                <Check
                  className={cn(
                    "w-4 h-4 text-muted-foreground/50 ml-4",
                    index < currIndex ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
