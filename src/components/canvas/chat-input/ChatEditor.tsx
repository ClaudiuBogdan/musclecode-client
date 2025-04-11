import React, { useCallback, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { EditorState, Extension } from "@codemirror/state";
import { baseTheme, lightThemeVars, darkThemeVars } from "./theme";

export interface ChatEditorProps {
  /** The current value of the editor */
  value: string;
  /** Called when the editor value changes */
  onChange: (value: string) => void;
  /** Whether to use dark mode */
  isDarkMode: boolean;
  /** Called when the editor is mounted */
  onMount?: (view: EditorView) => void;
  /** Called when the editor focus state changes */
  onFocusChange?: (isFocused: boolean) => void;
  /** Initial placeholder text */
  placeholder?: string;
  /** Min height of the editor */
  minHeight?: string;
  /** Max height of the editor */
  maxHeight?: string;
}

/**
 * ChatEditor component that encapsulates CodeMirror for chat message input
 */
const ChatEditor = React.forwardRef<
  { focusEditor: (position?: number) => void },
  ChatEditorProps
>(
  (
    {
      value,
      onChange,
      isDarkMode,
      onMount,
      onFocusChange,
      placeholder = "Type your message here",
      minHeight = "16rem",
      maxHeight = "200px",
    },
    ref
  ) => {
    const editorViewRef = useRef<EditorView | null>(null);

    /**
     * Handles changes in the CodeMirror editor value.
     */
    const handleChange = useCallback(
      (newValue: string) => {
        onChange(newValue);
      },
      [onChange]
    );

    /**
     * Handles editor mount event
     */
    const handleEditorMount = useCallback(
      (view: EditorView) => {
        editorViewRef.current = view;
        if (onMount) {
          onMount(view);
        }
      },
      [onMount]
    );

    /**
     * Focuses the editor and optionally sets cursor position
     */
    const focusEditor = useCallback((position?: number) => {
      if (editorViewRef.current) {
        editorViewRef.current.focus();
        if (position !== undefined) {
          const pos = position;
          const transaction = editorViewRef.current.state.update({
            selection: { anchor: pos, head: pos },
          });
          editorViewRef.current.dispatch(transaction);
        }
      }
    }, []);

    // Expose the focusEditor method via ref
    React.useImperativeHandle(
      ref,
      () => ({
        focusEditor,
      }),
      [focusEditor]
    );

    // Build CodeMirror extensions
    const editorExtensions: Extension[] = [
      baseTheme,
      isDarkMode ? darkThemeVars : lightThemeVars,
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
      EditorState.tabSize.of(4),
      EditorView.contentAttributes.of({ "aria-label": "Chat input" }),
      EditorView.updateListener.of((update) => {
        if (update.focusChanged && onFocusChange) {
          onFocusChange(update.view.hasFocus);
        }
      }),
    ];

    return (
      <div className="relative w-full">
        <CodeMirror
          value={value}
          height="auto"
          minHeight={minHeight}
          maxHeight={maxHeight}
          extensions={editorExtensions}
          onChange={handleChange}
          onCreateEditor={handleEditorMount}
          theme="none" // Using custom theme extensions
          placeholder={placeholder}
          style={{ width: "100%" }}
        />
      </div>
    );
  }
);

ChatEditor.displayName = "ChatEditor";

export { ChatEditor };
