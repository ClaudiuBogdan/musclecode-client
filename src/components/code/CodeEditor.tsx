import { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";

interface CodeEditorProps {
  initialValue?: string;
  lang?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
}

export const CodeEditor = ({
  initialValue = "",
  lang,
  onChange,
  onFocus,
}: CodeEditorProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (val: string) => {
      setValue(val);
      onChange?.(val);
    },
    [onChange]
  );

  const getLanguageExtension = useCallback(() => {
    switch (lang?.toLowerCase()) {
      case "typescript":
        return javascript({ jsx: false, typescript: true });
      case "javascript":
        return javascript({ jsx: false, typescript: false });
      case "python":
        return python();
      default:
        return python();
    }
  }, [lang]);

  return (
    <div className="h-full w-full relative code-editor">
      <CodeMirror
        className="h-full w-full absolute inset-0"
        value={value}
        height="100%"
        style={{
          fontSize: "1rem",
        }}
        theme={vscodeDark}
        extensions={[getLanguageExtension()]}
        basicSetup={{
          autocompletion: false,
          allowMultipleSelections: false,
        }}
        onFocus={onFocus}
        onChange={handleChange}
      />
    </div>
  );
};
