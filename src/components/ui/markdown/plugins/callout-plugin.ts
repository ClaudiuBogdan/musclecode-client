import { visit } from "unist-util-visit";

import type { Plugin } from "unified";
import type { Node } from "unist";

// Type definitions for remark AST
interface TextNode extends Node {
  type: "text";
  value: string;
}

interface ParagraphNode extends Node {
  type: "paragraph";
  children: (TextNode | Node)[];
}

interface BlockquoteNode extends Node {
  type: "blockquote";
  children: (ParagraphNode | Node)[];
}

interface ParentNode extends Node {
  children: Node[];
}

// Custom types for the AST nodes
interface CalloutNode extends Node {
  type: "callout";
  calloutType?: string;
  title?: string;
  content?: string;
  children: Node[];
  data: {
    hName: string;
    hProperties?: {
      calloutType: string;
      title?: string;
      content: string;
      foldable?: string; // "true" or "false". If I use boolean type, it gets converted to empty string so I decided to use string type.
      expanded?: string;
    };
  };
}

export const remarkCallouts: Plugin = () => {
  return (tree, file) => {
    visit(
      tree,
      "blockquote",
      (
        node: BlockquoteNode,
        index: number | null,
        parent: ParentNode | null
      ) => {
        if (
          !node.position ||
          typeof node.position.start.offset !== "number" ||
          typeof node.position.end.offset !== "number" ||
          index === null ||
          !parent
        ) {
          return;
        }
        // Get the raw markdown string corresponding to this blockquote.
        const rawBlockquote = String(file.value).slice(
          node.position.start.offset,
          node.position.end.offset
        );

        // Split the raw blockquote into lines and remove leading ">" markers.
        // We use a simple regex to remove ">" and any following whitespace.
        const lines = rawBlockquote
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""));
        if (lines.length === 0) return;

        // The first line should contain the callout marker and optional title.
        // It should be of the form: [!TYPE] Title (title is optional)
        const headerRegex = /^\[!(?<type>[^\]]+)\](\s*(?<title>.+))?$/;
        const headerMatch = headerRegex.exec(lines[0]?.trim());

        if (!headerMatch?.groups) return;
        let { type = "", title = "" } = headerMatch.groups;
        type = type.trim().toLowerCase();
        title = title.trim();
        let foldable = false;
        let expanded = false;

        const firstTitleChar = title.charAt(0);
        if (firstTitleChar === "+" || firstTitleChar === "-") {
          title = title.slice(1).trim();
          foldable = true;
          expanded = firstTitleChar === "+";
        }

        // The content is every line after the first line.
        // Join them back with newline to preserve formatting.
        const content = lines.slice(1).join("\n").trim();

        // Create a new callout node
        const calloutNode: CalloutNode = {
          type: "callout",
          children: [], // Handled by the custom component.
          data: {
            hName: "callout",
            hProperties: {
              calloutType: type.toLowerCase(),
              title: title.trim() ? title.trim() : undefined,
              content: content,
              foldable: foldable ? "true" : "false",
              expanded: expanded ? "true" : "false",
            },
          },
        };

        // Replace the original blockquote node with our new callout node.
        parent.children.splice(index, 1, calloutNode);
      }
    );
  };
};
