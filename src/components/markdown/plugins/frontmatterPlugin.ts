import {
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
  EditorView,
  Decoration,
} from "@codemirror/view";
import { EditorState, Extension, RangeSetBuilder } from "@codemirror/state";

/** Maximum bytes scanned from the document start when looking for frontmatter. */
const FM_SCAN_LIMIT = 4096;

/**
 * Returns the end position (exclusive) of the YAML frontmatter block if one
 * exists at the very start of the document, or -1 if not found.
 *
 * Exported so callers (e.g. focusAtStart) can skip past the hidden region
 * without needing to parse YAML themselves.
 */
export function frontmatterEnd(state: EditorState): number {
  const limit = Math.min(state.doc.length, FM_SCAN_LIMIT);
  const head = state.doc.sliceString(0, limit);

  if (!head.startsWith("---\n")) return -1;

  const afterOpen = head.slice(4);

  const closeIdx = afterOpen.indexOf("\n---\n");
  if (closeIdx !== -1) return 4 + closeIdx + 5;

  // Closing delimiter at EOF with no trailing newline.
  if (afterOpen.endsWith("\n---") && 4 + afterOpen.length >= state.doc.length) {
    return state.doc.length;
  }

  return -1;
}

function buildDecorations(state: EditorState): DecorationSet {
  const end = frontmatterEnd(state);
  if (end === -1) return Decoration.none;

  const builder = new RangeSetBuilder<Decoration>();
  builder.add(0, end, Decoration.replace({}));
  return builder.finish();
}

const frontmatterViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildDecorations(update.view.state);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.decorations ?? Decoration.none,
      ),
  },
);

/**
 * Blocks any insertion or deletion whose start position falls inside the
 * frontmatter region. Catches programmatic edits, undo steps, and pastes
 * that atomicRanges alone would not prevent.
 */
const frontmatterReadOnly = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged) return tr;
  const end = frontmatterEnd(tr.startState);
  if (end === -1) return tr;

  let blocked = false;
  tr.changes.iterChangedRanges((fromA) => {
    if (fromA < end) blocked = true;
  });

  return blocked ? [] : tr;
});

/**
 * Composite extension: invisible replace decoration + atomic cursor skipping
 * + read-only transaction filter over the frontmatter region.
 */
export const frontmatterPlugin: Extension = [
  frontmatterViewPlugin,
  frontmatterReadOnly,
];
