# Managing Editor State for Multiple Files in CodeMirror

When working on a multi-file editor where each file may have its own undo/redo history, there are several approaches to ensure that each file’s CodeMirror instance preserves its state. In our implementation, we already render an editor per file and use an `active` prop to toggle visibility. However, the default implementation with inline CSS (`display: block`/`none`) may be improved both in terms of state management and UI hiding of inactive editors.

Below are two approaches to consider:

---

## Option 1: Keep Inactive Editors Mounted

### Overview

By keeping each editor mounted and simply hiding the inactive ones via CSS, CodeMirror maintains its internal state—including undo/redo history. This approach is straightforward since the editor’s lifecycle is completely managed by CodeMirror.

### Pros

- **Simplicity:** No need to reinitialize or cache the editor state.
- **Preservation of History:** The full state (including cursor positions and undo history) is preserved across tabs.

### Cons

- **Performance:** Might not scale well if a very large number of editors are instantiated at once.
- **Layout/Focus:** Hidden elements might cause styling quirks if not handled carefully.

### Improved Hiding Strategy

Instead of toggling the inline `display: none` style, which removes the element from the layout (and may trigger reflow issues when it becomes active), a better technique is to use CSS classes that visually hide the editor while keeping it in the DOM.

#### Example CSS (using a CSS module)

```css:src/components/code/CodeEditor.module.css
.editorContainer {
  width: 100%;
  height: 100%;
  position: relative;
}

.activeEditor {
  opacity: 1;
  pointer-events: auto;
  position: relative;
  transition: opacity 0.2s ease-in-out;
}

.inactiveEditor {
  /* Instead of display: none, we hide the editor visually. */
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease-in-out;
}
```

#### Adapting the CodeEditor Component

Change the CodeEditor “wrapper” to use these classes. For example:

```tsx:src/components/code/CodeEditor.tsx
import React, { useEffect, useRef } from "react";
import styles from "./CodeEditor.module.css";

// ... CodeMirror initialization code ...

export function CodeEditor({
  active,
  initialValue,
  lang,
  readOnly,
  onChange,
  onFocus,
}: {
  active: boolean;
  initialValue: string;
  lang: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize CodeMirror editor here using editorRef
  
  return (
    <div
      className={`${styles.editorContainer} ${
        active ? styles.activeEditor : styles.inactiveEditor
      }`}
      // Call onFocus when the editor is clicked/focused
      onClick={onFocus}
    >
      {/* CodeMirror mounts into this container */}
    </div>
  );
}
```

*Key Notes:*
- The editor stays in the DOM, preserving its internal undo/redo stack.
- The inactive editor is still “around” but not visible and non-interactive.
- Upon activation, a subtle CSS transition can make it visible smoothly.

---

## Option 2: Persist and Restore Editor State on Unmount/Remount

### Overview

If mounting every editor at once is too resource-intensive (e.g., when many files are open), you can “snapshot” the CodeMirror editor’s state when the file is deactivated and then reinitialize it when it is activated again.

### How It Works

1. **On Unmount or Blur:** Save the current CodeMirror `EditorState`, which includes the document, undo history, and UI state.
2. **Store the State:** Cache this state (for instance, in a Zustand store or React Context) keyed by the file’s identifier.
3. **On Remount or Activation:** Reinitialize CodeMirror using the cached `EditorState`.

### Pros

- **Scalability:** Only active editors are fully instantiated; inactive files have their state persisted in memory.
- **Full Restoration:** The full undo history and state can be restored, providing a seamless user experience.

### Cons

- **Complexity:** Requires a more involved implementation of capturing and restoring the editor state.
- **State Serialization:** Direct serialization of `EditorState` may be problematic, so the state should remain in memory.

### Sample Implementation

#### Custom Hook for Managing Persistent Editor State

```tsx:src/hooks/usePersistentEditorState.tsx
import { useState, useEffect, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror"; // Example: adjust according to your setup

export function usePersistentEditorState(fileId: string, initialValue: string) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  useEffect(() => {
    if (!editorState) {
      // Create a new EditorState instance if one doesn’t exist.
      const state = EditorState.create({
        doc: initialValue,
        extensions: [
          basicSetup,
          // Add your language, theme, and other CodeMirror extensions here.
        ],
      });
      setEditorState(state);
    }
  }, [editorState, initialValue]);

  const persistState = useCallback(
    (newState: EditorState) => {
      // Save the new state in a central store if desired.
      setEditorState(newState);
    },
    []
  );

  return { editorState, persistState };
}
```

#### Integrating the Hook with Your CodeEditor Component

You can then integrate this hook into your `CodeEditor` so that when the component unmounts or loses focus, you persist its state. For example:

```tsx:src/components/code/CodeEditor.tsx
import React, { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { usePersistentEditorState } from "../../hooks/usePersistentEditorState";
import styles from "./CodeEditor.module.css";

export function CodeEditor({
  active,
  fileId,
  initialValue,
  lang,
  readOnly,
  onChange,
  onFocus,
}: {
  active: boolean;
  fileId: string;
  initialValue: string;
  lang: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { editorState, persistState } = usePersistentEditorState(fileId, initialValue);

  useEffect(() => {
    if (!editorRef.current || viewRef.current || !editorState) return;

    // Create a new EditorView using the persisted EditorState
    viewRef.current = new EditorView({
      state: editorState,
      parent: editorRef.current,
      dispatch: (transaction) => {
        const newState = viewRef.current!.state.update(transaction);
        viewRef.current!.update([transaction]);
        onChange(newState.state.doc.toString());
        // Persist the updated state
        persistState(viewRef.current!.state);
      },
    });

    return () => {
      // When unmounting, we could persist the state again
      if (viewRef.current) {
        persistState(viewRef.current.state);
      }
    };
  }, [editorState, onChange, persistState]);

  return (
    <div
      ref={editorRef}
      className={`${styles.editorContainer} ${
        active ? styles.activeEditor : styles.inactiveEditor
      }`}
      onClick={onFocus}
    />
  );
}
```

*Key Notes:*
- Here, the hook manages an in-memory `EditorState` keyed by the file ID.
- When the component unmounts, the current state (including undo history) is persisted.
- When the file is reactivated, the CodeMirror instance is reinitialized with the previously saved state.

---

## Summary and Recommendations

### Option 1: Keep Inactive Editors Mounted
- **Simple and straightforward.**
- Works best if the total number of active files (editors) is small.
- **Improved Hiding:** Use CSS classes (as shown above) that hide the editor via opacity and position rather than `display: none` to maintain layout and avoid reinitializing dimensions.

### Option 2: Persist and Restore Editor State
- **Scalable:** Better for large applications where opening many editors concurrently is a concern.
- **Complexity:** More complex to implement but ensures that even if an editor is unmounted, all the work (including undo history) is preserved.

### Hiding Inactive Editors: Better Practices

Avoid using inline `display: none` since it completely removes the element from the layout, potentially interfering with CodeMirror’s sizing calculations. Instead, adopt a CSS strategy such as:

- **Using opacity and pointer-events:**
  - Preserves the DOM and state, while making the element invisible and non-interactive.
- **Positioning off-screen (if needed):**
  - Alternatively, position the inactive editor absolutely off-screen. However, ensure that this does not have unintended side effects on sibling components.

---

## Architectural Decision Record (ADR)

**Title:** Managing CodeMirror Editor Lifecycle for Multi-File Editing

**Context:**  
Multiple files are being edited concurrently and each file must maintain its undo history.  
Using standard unmounting techniques might dispose of the editor’s internal state, leading to issues when undo/redo actions are triggered after switching files.

**Decision:**  
1. Use a persistent mounting strategy for a small number of files (Option 1) while leveraging CSS classes (using opacity, pointer-events, and absolute positioning) for visually hiding inactive editors.  
2. For scalability, implement a persistence mechanism that saves and restores the full CodeMirror EditorState for each file (Option 2).

**Consequences:**  
- **Option 1 Pros:** Simple and preserves state naturally.  
- **Option 1 Cons:** Performance issues when many files are open.  
- **Option 2 Pros:** Scalable and state is maintained even if editors unmount.  
- **Option 2 Cons:** Increased complexity and additional state management overhead.

**Package Manager:**  
All dependencies are managed using Yarn (e.g., `yarn add @codemirror/state @codemirror/view`).
