import React, { useState, useCallback, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { ContextReference } from "../chat/types";
import { useTheme } from "../../theme/theme-provider";
import { ChatEditor } from "./ChatEditor";
import ContextSelector from "./ContextSelector";

export interface ChatInputProps {
  /** Initial value for the editor */
  initialValue?: string;
  /** Initial contexts */
  initialContexts?: ContextReference[];
  /** Called when the user submits a message */
  onSubmit?: (value: string, contexts: ContextReference[]) => void;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Called when selected contexts change */
  onContextsChange?: (contexts: ContextReference[]) => void;
  /** Placeholder text for the editor */
  placeholder?: string;
}

/**
 * ChatInput component that combines context selection with a code editor
 */
const ChatInput: React.FC<ChatInputProps> = ({
  initialValue = "",
  initialContexts = [],
  onSubmit,
  onChange,
  onContextsChange,
  placeholder = "Type your message here",
}) => {
  // --- State ---
  const [value, setValue] = useState<string>(initialValue);
  const [selectedContexts, setSelectedContexts] =
    useState<ContextReference[]>(initialContexts);
  const [isToolbarMenuOpen, setIsToolbarMenuOpen] = useState(false);
  const { theme } = useTheme();

  // --- Refs ---
  const editorViewRef = useRef<EditorView | null>(null);
  const editorRef = useRef<{ focusEditor: (position?: number) => void } | null>(
    null
  );
  const lastCursorPosRef = useRef<number | null>(null);

  // --- Helper Functions ---

  /**
   * Focuses the editor and restores the cursor position if known
   */
  const focusEditorAndRestoreCursor = useCallback(() => {
    if (editorRef.current) {
      const position = lastCursorPosRef.current ?? undefined;
      setTimeout(() => {
        editorRef.current?.focusEditor(position);
        lastCursorPosRef.current = null; // Reset after restoring
      }, 0);
    }
  }, []);

  /**
   * Saves the current cursor position from the editor view
   */
  const saveCursorPosition = useCallback(() => {
    if (editorViewRef.current) {
      lastCursorPosRef.current =
        editorViewRef.current.state.selection.main.head;
    }
  }, []);

  // --- Event Handlers ---

  /**
   * Handles changes in the editor content
   */
  const handleEditorChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  /**
   * Handles context selection changes
   */
  const handleContextsChange = useCallback(
    (contexts: ContextReference[]) => {
      setSelectedContexts(contexts);

      if (onContextsChange) {
        onContextsChange(contexts);
      }
    },
    [onContextsChange]
  );

  /**
   * Stores the EditorView instance when CodeMirror is initialized
   */
  const handleEditorMount = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  /**
   * Handles special key commands like Ctrl+Enter for submit
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Submit on Ctrl+Enter or Cmd+Enter
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        if (onSubmit && value.trim()) {
          onSubmit(value, selectedContexts);
          setValue(""); // Clear the input after submit
        }
      }
    },
    [value, selectedContexts, onSubmit]
  );

  return (
    <div className="w-full p-4 bg-transparent" onKeyDown={handleKeyDown}>
      {/* Context Selector */}
      <ContextSelector
        selectedContexts={selectedContexts}
        onContextsChange={handleContextsChange}
        isMenuOpen={isToolbarMenuOpen}
        onMenuOpenChange={setIsToolbarMenuOpen}
        onSaveCursorPosition={saveCursorPosition}
        onFocusEditor={focusEditorAndRestoreCursor}
      />

      {/* ChatEditor */}
      <div className="relative">
        <ChatEditor
          ref={editorRef}
          value={value}
          onChange={handleEditorChange}
          isDarkMode={theme === "dark"}
          onMount={handleEditorMount}
          placeholder={placeholder}
        />
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Use the @ button or press ⌘/ to add context. Press Ctrl+Enter to send.
      </div>
    </div>
  );
};

export default ChatInput;
