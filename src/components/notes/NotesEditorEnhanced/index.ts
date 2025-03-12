import { ViewPlugin } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';

import tagParser from './tagParser';
import highlightStyle from './highlightStyle';
import RichEditPlugin from './richEdit';
import renderBlock from './renderBlock';

import type { Config } from '@markdoc/markdoc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarkdocPluginConfig = { lezer?: any, markdoc: Config };

export default function (config: MarkdocPluginConfig) {
  const mergedConfig = {
    ...config.lezer ?? [],
    extensions: [tagParser, ...config.lezer?.extensions ?? []]
  };

  return ViewPlugin.fromClass(RichEditPlugin, {
    decorations: (plugin) => plugin.decorations,
    provide: () => [
      renderBlock(config.markdoc),
      syntaxHighlighting(highlightStyle),
      markdown(mergedConfig),
    ],
    eventHandlers: {
      mousedown({ target }, view) {
        if (
          target instanceof Element &&
          target.matches(".cm-markdoc-renderBlock *")
        )
          view.dispatch({ selection: { anchor: view.posAtDOM(target) } });
      },
    },
  });
}