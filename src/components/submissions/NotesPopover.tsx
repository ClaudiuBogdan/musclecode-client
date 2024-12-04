import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotebookIcon } from "lucide-react";

interface NotesPopoverProps {
  notes: string;
}

export function NotesPopover({ notes }: NotesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <NotebookIcon size={18} className="text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-2">
          <label className="text-xs font-medium">Notes</label>
          <div className="min-h-[120px] p-2 bg-secondary text-secondary-foreground rounded-md text-sm">
            {notes || "No notes provided."}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
