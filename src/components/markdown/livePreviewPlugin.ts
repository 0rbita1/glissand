import {
  ViewPlugin,
  Decoration,
  DecorationSet,
  ViewUpdate,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if any cursor/selection overlaps the given character range. */
function cursorOverlaps(from: number, to: number, view: EditorView): boolean {
  for (const sel of view.state.selection.ranges) {
    if (sel.from <= to && sel.to >= from) return true;
  }
  return false;
}

/** Returns true if the cursor is on the same LINE as the given range. */
function cursorOnSameLine(from: number, to: number, view: EditorView): boolean {
  const doc = view.state.doc;
  const lineFrom = doc.lineAt(from).number;
  const lineTo = doc.lineAt(to).number;
  for (const sel of view.state.selection.ranges) {
    const cursorLine = doc.lineAt(sel.head).number;
    if (cursorLine >= lineFrom && cursorLine <= lineTo) return true;
  }
  return false;
}

// ─── Decoration definitions (flyweight — defined once, reused everywhere) ───

const hide = Decoration.mark({ class: "md-hide" });

const bold = Decoration.mark({ class: "md-bold" });
const italic = Decoration.mark({ class: "md-italic" });
const strike = Decoration.mark({ class: "md-strike" });
const code = Decoration.mark({ class: "md-code" });
const codeBlock = Decoration.mark({ class: "md-codeblock" });
const blockquote = Decoration.mark({ class: "md-blockquote" });
const link = Decoration.mark({ class: "md-link" });
const hrDeco = Decoration.mark({ class: "md-hr" });

const headingDeco: Record<string, Decoration> = {
  ATXHeading1: Decoration.mark({ class: "md-h1" }),
  ATXHeading2: Decoration.mark({ class: "md-h2" }),
  ATXHeading3: Decoration.mark({ class: "md-h3" }),
  ATXHeading4: Decoration.mark({ class: "md-h4" }),
  ATXHeading5: Decoration.mark({ class: "md-h5" }),
  ATXHeading6: Decoration.mark({ class: "md-h6" }),
};

// Node names whose characters should be hidden when cursor is away
const SYNTAX_MARKS = new Set([
  "HeaderMark",
  "EmphasisMark",
  "StrikethroughMark",
  "LinkMark",
  "QuoteMark",
  "TableDelimiter",
  "TaskMarker",
]);

// Node names that get a content-level style applied to the whole range
const CONTENT_STYLES: Record<string, Decoration> = {
  StrongEmphasis: bold,
  Emphasis: italic,
  Strikethrough: strike,
  InlineCode: code,
  FencedCode: codeBlock,
  Blockquote: blockquote,
  Link: link,
  HorizontalRule: hrDeco,
};

// ─── Image Widget ────────────────────────────────────────────────────────────

class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly alt: string,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt;
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = "md-image-widget";

    const img = document.createElement("img");
    img.src = this.src;
    img.alt = this.alt;
    img.className = "md-image";
    img.onerror = () => {
      img.style.display = "none";
      const err = document.createElement("span");
      err.className = "md-image-error";
      err.textContent = `⚠ Cannot load: ${this.alt || this.src}`;
      wrap.appendChild(err);
    };

    wrap.appendChild(img);
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

// ─── Table line decoration ────────────────────────────────────────────────────

const tableRow = Decoration.mark({ class: "md-table-row" });
const tableHead = Decoration.mark({ class: "md-table-head" });
const listItem = Decoration.mark({ class: "md-list-item" });

// ─── Main decoration builder ─────────────────────────────────────────────────

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        const cursorAway = !cursorOverlaps(node.from, node.to, view);
        const lineAway = !cursorOnSameLine(node.from, node.to, view);

        // ── Headings ──────────────────────────────────────────────────────
        const hDeco = headingDeco[node.name];
        if (hDeco) {
          // Always apply heading style
          builder.add(node.from, node.to, hDeco);
        }

        // ── Content-level styles (bold, italic, etc.) ─────────────────────
        const cDeco = CONTENT_STYLES[node.name];
        if (cDeco) {
          // Blockquote bar should always be visible; other styles only when cursor is away
          if (node.name === "Blockquote") {
            builder.add(node.from, node.to, cDeco);
          } else if (lineAway) {
            builder.add(node.from, node.to, cDeco);

            // For InlineCode, hide the opening and closing backtick marks
            if (node.name === "InlineCode") {
              node.node.cursor().iterate((child) => {
                if (child.name === "CodeMark") {
                  builder.add(child.from, child.to, hide);
                }
              });
            }
          }
        }

        // ── Hide syntax marks when cursor is not on the same line ─────────
        if (SYNTAX_MARKS.has(node.name) && lineAway) {
          builder.add(node.from, node.to, hide);

          // Also hide the space after HeaderMark (e.g. "## Title" → hide "## ")
          if (node.name === "HeaderMark") {
            const nextChar = view.state.doc.sliceString(node.to, node.to + 1);
            if (nextChar === " ") {
              builder.add(node.to, node.to + 1, hide);
            }
          }
        }

        // ── List marks ────────────────────────────────────────────────────
        if (node.name === "ListMark" && lineAway) {
          builder.add(node.from, node.to, hide);
          builder.add(node.from, node.to, listItem);
        }

        // ── Images ────────────────────────────────────────────────────────
        if (node.name === "Image" && lineAway) {
          let src = "";
          let alt = "";
          node.node.cursor().iterate((child) => {
            if (child.name === "URL") {
              src = view.state.doc.sliceString(child.from, child.to);
            }
            if (child.name === "LinkLabel") {
              alt = view.state.doc.sliceString(child.from, child.to);
            }
          });
          if (src) {
            builder.add(
              node.from,
              node.to,
              Decoration.replace({ widget: new ImageWidget(src, alt) }),
            );
          }
        }

        // ── Tables ────────────────────────────────────────────────────────
        if (node.name === "TableHeader") {
          builder.add(node.from, node.to, tableHead);
        }
        if (node.name === "TableRow") {
          builder.add(node.from, node.to, tableRow);
        }
      },
    });
  }

  return builder.finish();
}

// ─── The exported plugin ─────────────────────────────────────────────────────

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
