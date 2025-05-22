import type { FC } from "react";

import CodeMirror from "@uiw/react-codemirror";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { syntaxHighlighting, indentOnInput } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import {
  keymap,
  EditorView,
  drawSelection,
  rectangularSelection,
  highlightActiveLine,
} from "@codemirror/view";
import { Table } from "@lezer/markdown";

import "./src/style.css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

import richEditor from ".";
import highlightStyle from "./highlightStyle";
import config from "./markdoc";
import { useTheme } from "../../theme/theme-provider";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditorEnhanced: FC<NotesEditorProps> = ({
  value,
  onChange,
}) => {
  const { theme } = useTheme();
  return (
    <div className="h-full w-full relative">
      <CodeMirror
        value={value}
        height="100%"
        className="h-full overflow-auto"
        theme={theme === "light" ? "light" : vscodeDark}
        extensions={[
          richEditor({
            markdoc: config,
            lezer: {
              codeLanguages: languages,
              extensions: [Table],
            },
          }),
          EditorView.lineWrapping,
          history(),
          drawSelection(),
          rectangularSelection(),
          highlightActiveLine(),
          indentOnInput(),
          syntaxHighlighting(highlightStyle),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
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
