import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.theme({
  "&": {
    color: "var(--cm-foreground)",
    backgroundColor: "var(--cm-background)",
    fontSize: "14px",
    border: "1px solid var(--cm-border-color)",
    borderRadius: "6px",
    padding: "0px",
    overflow: "hidden",
  },
  ".cm-content": {
    fontFamily: "inherit",
    padding: "8px 12px",
    caretColor: "var(--cm-caret-color)",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-line": {
    padding: "0 2px",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--cm-caret-color)",
  },
  "&.cm-focused": {
    outline: "none",
    borderColor: "var(--cm-focus-border-color)",
    boxShadow: "0 0 0 1px var(--cm-focus-border-color)",
  },
  ".cm-reference-token": {
    backgroundColor: "var(--cm-token-background)",
    color: "var(--cm-token-foreground)",
    border: "1px solid var(--cm-token-border)",
    borderRadius: "4px",
    padding: "1px 4px",
    margin: "0 1px",
    display: "inline-block",
    cursor: "text",
    "&::selection": {
      backgroundColor: "var(--cm-token-selection-background) !important",
    },
    "&.cm-selectionBackground": {
      backgroundColor: "var(--cm-token-selection-background) !important",
    },
  },
  ".cm-unknown-reference": {
    color: "var(--unknown-reference-color)",
    backgroundColor: "var(--unknown-reference-bg)",
    borderRadius: "2px",
    padding: "0 2px",
    textDecoration: "none",
  },
});

export const lightThemeVars = EditorView.theme({
  "&": {
    "--cm-foreground": "#24292e",
    "--cm-background": "#ffffff",
    "--cm-border-color": "#e1e4e8",
    "--cm-focus-border-color": "#0366d6",
    "--cm-caret-color": "#0366d6",
    "--cm-token-background": "rgba(27, 31, 35, 0.05)",
    "--cm-token-foreground": "#0366d6",
    "--cm-token-border": "rgba(27, 31, 35, 0.1)",
    "--cm-token-selection-background": "rgba(3, 102, 214, 0.3)",
    "--reference-color": "#0366d6",
    "--reference-bg": "rgba(3, 102, 214, 0.1)",
    "--unknown-reference-color": "#a0a0a0",
    "--unknown-reference-bg": "rgba(0, 0, 0, 0.05)",
    "--cm-section-header-color": "#6a737d",
  },
});

export const darkThemeVars = EditorView.theme({
  "&": {
    "--cm-foreground": "#c9d1d9",
    "--cm-background": "#0d1117",
    "--cm-border-color": "#30363d",
    "--cm-focus-border-color": "#1f6feb",
    "--cm-caret-color": "#58a6ff",
    "--cm-token-background": "rgba(56, 139, 253, 0.15)",
    "--cm-token-foreground": "#79c0ff",
    "--cm-token-border": "rgba(56, 139, 253, 0.4)",
    "--cm-token-selection-background": "rgba(56, 139, 253, 0.3)",
    "--reference-color": "#58a6ff",
    "--reference-bg": "rgba(88, 166, 255, 0.1)",
    "--unknown-reference-color": "#888888",
    "--unknown-reference-bg": "rgba(255, 255, 255, 0.1)",
    "--cm-section-header-color": "#8b949e",
  },
});
