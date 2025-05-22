import { go } from "@codemirror/lang-go";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

interface CodeEditorProps {
  initialValue?: string;
  hidden?: boolean;
  lang?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
}

export const CodeEditor = ({
  initialValue = "",
  hidden = false,
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
    if (!hidden && editorRef.current) {
      editorRef.current?.view?.focus();
    }
  }, [hidden]);

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
      hidden={hidden}
      aria-hidden={hidden}
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
