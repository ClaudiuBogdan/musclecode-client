import { FC } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesEditor: FC<NotesEditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full w-full relative nodes-editor">
      <CodeMirror
        className="h-full w-full absolute "
        value={value}
        height="100%"
        width="100%"
        style={{
          fontSize: "1rem",
        }}
        theme={"light"}
        extensions={[markdown({ base: markdownLanguage })]}
        onChange={onChange}
        basicSetup={{
          autocompletion: false,
          allowMultipleSelections: false,
        }}
      />
    </div>
  );
};
