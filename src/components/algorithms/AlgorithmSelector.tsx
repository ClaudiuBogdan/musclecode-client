import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlgorithmPreview } from "@/types/algorithm";
import { apiClient } from "@/lib/api/client";

interface AlgorithmSelectorProps {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

export function AlgorithmSelector({
  selectedIds,
  onSelectedIdsChange,
}: AlgorithmSelectorProps) {
  const [open, setOpen] = useState(false);
  const [algorithms, setAlgorithms] = useState<AlgorithmPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await apiClient.get<AlgorithmPreview[]>("/algorithms");
        setAlgorithms(response.data);
      } catch (error) {
        console.error("Failed to fetch algorithms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  const selectedAlgorithms = algorithms.filter((a) =>
    selectedIds.includes(a.id)
  );

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading
              ? "Loading algorithms..."
              : selectedIds.length === 0
                ? "Select algorithms..."
                : `${selectedIds.length} algorithm${
                    selectedIds.length === 1 ? "" : "s"
                  } selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search algorithms..." />
            <CommandEmpty>No algorithms found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px]">
                {algorithms.map((algorithm) => (
                  <CommandItem
                    key={algorithm.id}
                    onSelect={() => {
                      const isSelected = selectedIds.includes(algorithm.id);
                      onSelectedIdsChange(
                        isSelected
                          ? selectedIds.filter((id) => id !== algorithm.id)
                          : [...selectedIds, algorithm.id]
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.includes(algorithm.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <div>{algorithm.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "capitalize",
                            algorithm.difficulty === "easy"
                              ? "text-green-500"
                              : algorithm.difficulty === "medium"
                                ? "text-yellow-500"
                                : "text-red-500"
                          )}
                        >
                          {algorithm.difficulty}
                        </span>
                        <span>•</span>
                        <span>{algorithm.categories.join(", ")}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAlgorithms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAlgorithms.map((algorithm) => (
            <Badge
              key={algorithm.id}
              variant="secondary"
              className="gap-1"
              onClick={() =>
                onSelectedIdsChange(
                  selectedIds.filter((id) => id !== algorithm.id)
                )
              }
            >
              {algorithm.title}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectedIdsChange(
                    selectedIds.filter((id) => id !== algorithm.id)
                  );
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
