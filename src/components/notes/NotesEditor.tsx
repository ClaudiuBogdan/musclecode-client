import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

import { useTheme } from "../theme/theme-provider";

import type { FC } from "react";


interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor: FC<NotesEditorProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  return (
    <div className="h-full w-full relative">
      <CodeMirror
        value={value}
        height="100%"
        className="h-full overflow-auto"
        theme={theme === "light" ? "light" : "dark"}
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
    </div>
  );
};