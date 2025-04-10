import {
  EditorView,
  ViewUpdate,
  Decoration,
  DecorationSet,
  ViewPlugin,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { contextOptions, getContextDisplayName } from "./types";

// Create a set of context names for efficient lookup
const contextNameMap = new Map<string, string>();
contextOptions.forEach((context) => {
  const name = getContextDisplayName(context);
  // Add the full name as is
  contextNameMap.set(name, name);

  // For key-value contexts, also add just the key
  if (context.type === "key_value") {
    contextNameMap.set(context.key_value.key, context.key_value.key);
  }
});

// Match @name tokens, including potential key-value syntax with ::
// The regex allows for just @ by itself as well
export const tokenMatcher = /@([\w.-]*)?(::[\w.-]+)?\s*/g;

export const tokenHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc;

      for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        let match;

        // Reset regex lastIndex to avoid issues with multiple executions
        tokenMatcher.lastIndex = 0;

        while ((match = tokenMatcher.exec(text))) {
          const [fullMatch, key] = match;
          const matchStart = from + match.index;
          const matchEnd = matchStart + fullMatch.length;

          // If there's no key (just @) or key exists in our map, mark it as valid
          const isEmptyToken = !key || key === "";
          const keyExists = isEmptyToken || contextNameMap.has(key);

          // Determine if this is a valid context reference
          if (keyExists) {
            builder.add(
              matchStart,
              matchEnd,
              Decoration.mark({ class: "cm-reference-token" })
            );
          } else {
            // Unknown references get a different style
            builder.add(
              matchStart,
              matchEnd,
              Decoration.mark({ class: "cm-unknown-reference" })
            );
          }
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// Extract context tokens from text with potential key-value pairs
export function extractContextTokens(
  text: string
): { key: string; value?: string }[] {
  const matches: { key: string; value?: string }[] = [];
  let match;

  // Reset regex lastIndex
  tokenMatcher.lastIndex = 0;

  while ((match = tokenMatcher.exec(text))) {
    // Skip patterns that are just @ with nothing after
    if (match[0] === "@") continue;

    const key = match[1] || ""; // The key part (without @), might be empty
    let value = undefined;

    // Check if we have a value part (::value)
    if (match[2]) {
      value = match[2].substring(2); // Remove the :: prefix
    }

    matches.push({ key, value });
  }

  return matches;
}

// Helper to find a context by key or full name
export function findContextByKey(
  key: string,
  value?: string
):
  | {
      context: (typeof contextOptions)[number];
      matchesExactly: boolean;
    }
  | undefined {
  // If the key is empty, return null to indicate we should show all options
  if (key === "") {
    return undefined;
  }

  // First, try an exact match with key:value
  if (value) {
    const fullName = `${key}:${value}`;
    const exactMatch = contextOptions.find(
      (ctx) => getContextDisplayName(ctx) === fullName
    );

    if (exactMatch) {
      return { context: exactMatch, matchesExactly: true };
    }
  }

  // If no value or no exact match, try to find by key
  for (const ctx of contextOptions) {
    if (ctx.type === "key_value" && ctx.key_value.key === key) {
      return { context: ctx, matchesExactly: false };
    } else if (ctx.type === "prompt" && ctx.prompt.name === key) {
      return { context: ctx, matchesExactly: true };
    } else if (ctx.type === "canvas" && ctx.canvas.name === key) {
      return { context: ctx, matchesExactly: true };
    }
  }

  return undefined;
}
