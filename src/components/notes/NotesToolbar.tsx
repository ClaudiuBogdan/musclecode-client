import { FC } from "react";
import { Bold, Italic, List, Link, Image, Code, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

interface NotesToolbarProps {
  onAction: (action: string) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export const NotesToolbar: FC<NotesToolbarProps> = ({
  onAction,
  showPreview,
  onTogglePreview,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 border-b">
      <Button variant="ghost" size="icon" onClick={() => onAction("bold")}>
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAction("italic")}>
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" onClick={() => onAction("list")}>
        <List className="h-4 w-4" />
        <span className="sr-only">List</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAction("link")}>
        <Link className="h-4 w-4" />
        <span className="sr-only">Link</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAction("image")}>
        <Image className="h-4 w-4" />
        <span className="sr-only">Image</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onAction("code")}>
        <Code className="h-4 w-4" />
        <span className="sr-only">Code</span>
      </Button>
      <div className="ml-auto">
        <Toggle pressed={showPreview} onPressedChange={onTogglePreview}>
          {showPreview ? (
            <>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Show Preview</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Show Edit</span>
            </>
          )}
        </Toggle>
      </div>
    </div>
  );
};
