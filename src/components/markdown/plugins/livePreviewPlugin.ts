import {
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
  EditorView,
} from "@codemirror/view";
import { buildDecorations } from "./decorations/markdownDecorations";

export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);
