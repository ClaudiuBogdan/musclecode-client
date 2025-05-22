import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { ViewPlugin } from '@codemirror/view';

import highlightStyle from './highlightStyle';
import renderBlock from './renderBlock';
import RichEditPlugin from './richEdit';
import tagParser from './tagParser';

import type { Config } from '@markdoc/markdoc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MarkdocPluginConfig { lezer?: any, markdoc: Config }

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
          {view.dispatch({ selection: { anchor: view.posAtDOM(target) } });}
      },
    },
  });
}