import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { cursorOnSameLine } from "../../utils/cursorHelpers";
import { ImageWidget } from "../widgets/ImageWidget";
import { CheckboxWidget } from "../widgets/CheckboxWidget";
import {
  hide,
  hideText,
  headingDeco,
  SYNTAX_MARKS,
  CONTENT_STYLES,
  tableRow,
  tableHead,
  listItem,
} from "../constants/markdownConstants";

export function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        const lineAway = !cursorOnSameLine(node.from, node.to, view);

        // ── Headings ──────────────────────────────────────────────────────
        const hDeco = headingDeco[node.name];
        if (hDeco) {
          builder.add(node.from, node.to, hDeco);
        }

        // ── Content-level styles (bold, italic, etc.) ─────────────────────
        const cDeco = CONTENT_STYLES[node.name];
        if (cDeco) {
          if (node.name === "Emphasis") {
            const parent = node.node.parent;
            if (parent?.name === "StrongEmphasis") return;
          }

          if (node.name === "Blockquote") {
            builder.add(node.from, node.to, cDeco);
          } else if (node.name === "HorizontalRule") {
            builder.add(node.from, node.to, cDeco);
            if (lineAway) {
              builder.add(node.from, node.to, hideText);
            }
          } else if (lineAway) {
            builder.add(node.from, node.to, cDeco);

            if (node.name === "InlineCode") {
              node.node.cursor().iterate((child) => {
                if (child.name === "CodeMark") {
                  builder.add(child.from, child.to, hide);
                }
              });
            }

            if (node.name === "FencedCode") {
              const firstLine = view.state.doc.lineAt(node.from);
              const lastLine = view.state.doc.lineAt(node.to);

              if (!cursorOnSameLine(firstLine.from, firstLine.to, view)) {
                builder.add(firstLine.from, firstLine.to, hide);
              }
              if (!cursorOnSameLine(lastLine.from, lastLine.to, view)) {
                builder.add(lastLine.from, lastLine.to, hide);
              }
            }
          }
        }

        // ── Hide syntax marks ─────────────────────────────────────────────
        if (SYNTAX_MARKS.has(node.name) && lineAway) {
          if (node.name !== "TaskMarker") {
            builder.add(node.from, node.to, hide);
          }

          if (node.name === "HeaderMark") {
            const nextChar = view.state.doc.sliceString(node.to, node.to + 1);
            if (nextChar === " ") {
              builder.add(node.to, node.to + 1, hide);
            }
          }
        }

        // ── Task list checkboxes ──────────────────────────────────────────
        if (node.name === "TaskMarker") {
          const markerText = view.state.doc.sliceString(node.from, node.to);
          const checked = markerText === "[x]" || markerText === "[X]";
          if (lineAway) {
            builder.add(
              node.from,
              node.to,
              Decoration.replace({
                widget: new CheckboxWidget(checked, node.from),
              }),
            );
          }
        }

        // ── List marks ────────────────────────────────────────────────────
        if (node.name === "ListMark" && lineAway) {
          const line = view.state.doc.lineAt(node.from);
          const lineText = view.state.doc.sliceString(line.from, line.to);
          const isTaskItem = /^(\s*[-*+])\s+\[[ xX]\]/.test(lineText);
          const markText = view.state.doc.sliceString(node.from, node.to).trim();
          const isOrdered = /^\d+[.)]$/.test(markText);

          if (!isTaskItem && !isOrdered) {
            builder.add(node.from, node.to, hide);
            builder.add(node.from, node.to, listItem);
          }
          // Ordered marks (e.g. "1.", "2)") — leave visible, render naturally
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
