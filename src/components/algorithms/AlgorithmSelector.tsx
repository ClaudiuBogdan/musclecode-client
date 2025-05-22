import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { AlgorithmTemplate } from "@/types/algorithm";

interface AlgorithmSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  algorithms?: AlgorithmTemplate[];
  disabled?: boolean;
}

export function AlgorithmSelector({
  value = [],
  onChange,
  algorithms = [],
  disabled = false,
}: AlgorithmSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAlgorithms = algorithms.filter((a) => value.includes(a.id));
  const filteredAlgorithms = algorithms.filter(
    (alg) =>
      alg.title.toLowerCase().includes(search.toLowerCase()) ||
      alg.difficulty.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAlgorithm = (id: string) => {
    if (disabled) return;
    onChange(
      value.includes(id) ? value.filter((i) => i !== id) : [...value, id]
    );
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 px-4 rounded-lg"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedAlgorithms.length > 0
                ? `${selectedAlgorithms.length} selected`
                : "Select algorithms..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg shadow-lg"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <div className="px-2 pt-2">
              <CommandInput
                placeholder="Search algorithms..."
                value={search}
                onValueChange={setSearch}
                className="rounded-lg px-2 py-1"
              />
            </div>
            <CommandList>
              <CommandEmpty className="py-4 text-sm text-muted-foreground text-center">
                No algorithms found
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-1">
                    {filteredAlgorithms.map((algorithm) => (
                      <CommandItem
                        key={algorithm.id}
                        value={`${algorithm.title} ${algorithm.difficulty}`}
                        onSelect={() => toggleAlgorithm(algorithm.id)}
                        className="px-3 py-2 rounded-md aria-selected:bg-accent/50"
                      >
                        <div className="flex items-center space-x-3">
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 text-primary",
                              value.includes(algorithm.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">
                              {algorithm.title}
                            </p>
                            <span
                              className={cn(
                                "inline-block mt-1 px-2 py-0.5 rounded-full text-xs leading-none",
                                algorithm.difficulty === "easy" &&
                                  "bg-green-100 text-green-800",
                                algorithm.difficulty === "medium" &&
                                  "bg-yellow-100 text-yellow-800",
                                algorithm.difficulty === "hard" &&
                                  "bg-red-100 text-red-800"
                              )}
                            >
                              {algorithm.difficulty}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAlgorithms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAlgorithms.map((algorithm) => (
            <div
              key={algorithm.id}
              className="flex items-center pl-3 pr-1.5 py-1 rounded-full bg-accent text-sm group transition-colors"
            >
              <span className="mr-1.5 truncate max-w-[160px]">
                {algorithm.title}
              </span>
              <button
                onClick={() => toggleAlgorithm(algorithm.id)}
                className="rounded-full p-1 hover:bg-muted/50 transition-colors"
              >
                <X className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
