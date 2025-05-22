import { markdownLanguage } from "@codemirror/lang-markdown";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image,
  Code,
  Eye,
  Edit2,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface DescriptionEditorProps {
  isPreview?: boolean;
  value: string;
  onChange: (content: string) => void;
  hasError?: boolean;
}

export const DescriptionEditor = ({
  isPreview: defaultIsPreview,
  value,
  onChange,
  hasError,
}: DescriptionEditorProps) => {
  const { theme } = useTheme();
  const [isPreview, setIsPreview] = useState(defaultIsPreview);

  const handleToolbarAction = (action: string) => {
    if (isPreview) return;

    let insertion = "";
    const textarea = document.querySelector(
      ".cm-content"
    )!;
    if (!textarea) return;

    switch (action) {
      case "bold":
        insertion = "**bold text**";
        break;
      case "italic":
        insertion = "*italic text*";
        break;
      case "list":
        insertion = "\n- list item";
        break;
      case "link":
        insertion = "[link text](url)";
        break;
      case "image":
        insertion = "![alt text](image url)";
        break;
      case "code":
        insertion = "```\ncode block\n```";
        break;
    }

    onChange(value + insertion);
  };

  return (
    <div className="flex gap-4 flex-col h-full p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("bold")}
            disabled={isPreview}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("italic")}
            disabled={isPreview}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("list")}
            disabled={isPreview}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("link")}
            disabled={isPreview}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("image")}
            disabled={isPreview}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToolbarAction("code")}
            disabled={isPreview}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="gap-2"
        >
          {isPreview ? (
            <>
              <Edit2 className="h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-auto p-4 border rounded-md">
            <div
              className={cn(
                "prose prose-sm max-w-none",
                "prose-headings:text-foreground prose-p:text-foreground",
                "prose-strong:text-foreground prose-code:text-foreground",
                "prose-pre:bg-secondary prose-ul:text-foreground",
                "prose-li:text-foreground prose-blockquote:text-foreground",
                "prose-a:text-primary hover:prose-a:text-primary/80",
                "dark:prose-invert"
              )}
            >
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <CodeMirror
            value={value}
            height="100%"
            className={cn(
              "h-full overflow-auto rounded-md",
              hasError ? "border-2 border-destructive" : "border"
            )}
            theme={theme === "light" ? "light" : vscodeDark}
            extensions={[
              markdown({
                base: markdownLanguage,
                addKeymap: true,
              }),
              EditorView.lineWrapping,
            ]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
            }}
          />
        )}
      </div>
    </div>
  );
};
