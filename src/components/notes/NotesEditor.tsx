import { FC } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor: FC<NotesEditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full w-full relative">
      <CodeMirror
        value={value}
        height="100%"
        className="h-full overflow-auto"
        theme={"light"}
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
