import { FC } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor: FC<NotesEditorProps> = ({ value, onChange }) => {
  return (
    <CodeMirror
      value={value}
      height="100%"
      className="h-full overflow-auto"
      extensions={[markdown({ base: markdownLanguage })]}
      onChange={onChange}
      theme={vscodeDark}
    />
  );
};
