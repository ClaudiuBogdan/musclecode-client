import { HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export default HighlightStyle.define([
  {
    tag: t.heading1,
    fontWeight: "bold",
    textDecoration: "none",
    color: "hsl(var(--foreground))",
    class: "dark:text-white! text-2xl",
  },
  {
    tag: t.heading2,
    fontWeight: "bold",
    textDecoration: "none",
    color: "hsl(var(--foreground))",
    class: "dark:text-white! text-xl",
  },
  {
    tag: t.heading3,
    fontWeight: "bold",
    fontFamily: "var(--font-family, sans-serif)",
    fontSize: "24px",
    textDecoration: "none",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.heading4,
    fontWeight: "bold",
    fontFamily: "var(--font-family, sans-serif)",
    fontSize: "22px",
    textDecoration: "none",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.link,
    fontFamily: "var(--font-family, sans-serif)",
    textDecoration: "underline",
    color: "hsl(var(--primary))",
  },
  {
    tag: t.emphasis,
    fontFamily: "var(--font-family, sans-serif)",
    fontStyle: "italic",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.strong,
    fontFamily: "var(--font-family, sans-serif)",
    fontWeight: "bold",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.monospace,
    fontFamily: "monospace",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.content,
    fontFamily: "var(--font-family, sans-serif)",
    color: "hsl(var(--foreground))",
  },
  {
    tag: t.meta,
    color: "hsl(var(--muted-foreground))",
  },
  {
    tag: [t.keyword, t.operator, t.tagName, t.propertyName],
    color: "hsl(var(--primary))",
  },
  {
    tag: [t.atom, t.bool],
    color: "hsl(var(--primary))",
  },
  {
    tag: [t.number, t.literal],
    color: "hsl(var(--accent-foreground))",
  },
  {
    tag: t.string,
    color: "hsl(var(--accent-foreground))",
  },
  {
    tag: t.comment,
    color: "hsl(var(--muted-foreground))",
    fontStyle: "italic",
  },
  {
    tag: t.variableName,
    color: "hsl(var(--foreground))",
  },
  {
    tag: [t.typeName, t.className, t.namespace],
    color: "hsl(var(--primary))",
  },
]);