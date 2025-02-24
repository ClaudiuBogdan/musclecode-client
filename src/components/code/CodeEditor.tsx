import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { python } from "@codemirror/lang-python";
import { go } from "@codemirror/lang-go";

interface CodeEditorProps {
  initialValue?: string;
  active?: boolean;
  lang?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
}

export const CodeEditor = ({
  initialValue = "",
  active = false,
  lang,
  readOnly = false,
  onChange,
  onFocus,
}: CodeEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Add effect to update local state when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (active && editorRef.current) {
      editorRef.current?.view?.focus();
    }
  }, [active]);

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
      case "go":
        return go();
      default:
        return python();
    }
  }, [lang]);

  return (
    <div
      className="h-full w-full relative code-editor"
      hidden={!active}
      aria-hidden={!active}
    >
      <CodeMirror
        ref={editorRef}
        className="h-full w-full absolute inset-0"
        value={value}
        height="100%"
        editable={!readOnly}
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
