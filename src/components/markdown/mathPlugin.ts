import {
  DecorationSet,
  EditorView,
  WidgetType,
  Decoration,
} from "@codemirror/view";
import {
  RangeSetBuilder,
  EditorSelection,
  StateField,
  Transaction,
  EditorState,
} from "@codemirror/state";
import katex from "katex";

// ─── Cursor helpers ───────────────────────────────────────────────────────────

/** Returns true if any cursor/selection overlaps the given character range. */
function cursorOverlaps(
  from: number,
  to: number,
  state: EditorState,
): boolean {
  for (const sel of state.selection.ranges) {
    if (sel.from <= to && sel.to >= from) return true;
  }
  return false;
}

/** Returns true if the cursor is on the same LINE as the given range. */
function cursorOnSameLine(
  from: number,
  to: number,
  state: EditorState,
): boolean {
  const doc = state.doc;
  const lineFrom = doc.lineAt(from).number;
  const lineTo = doc.lineAt(to).number;
  for (const sel of state.selection.ranges) {
    const cursorLine = doc.lineAt(sel.head).number;
    if (cursorLine >= lineFrom && cursorLine <= lineTo) return true;
  }
  return false;
}

// ─── Block Math Widget ────────────────────────────────────────────────────────

class BlockMathWidget extends WidgetType {
  constructor(
    readonly tex: string,
    readonly from: number,
    readonly to: number,
  ) {
    super();
  }

  eq(other: BlockMathWidget) {
    return other.tex === this.tex;
  }

  toDOM(view: EditorView) {
    const div = document.createElement("div");
    div.className = "md-math-block";

    if (this.tex.trim().length === 0) {
      div.classList.add("md-math-block-empty");
      div.textContent = "Empty math expression";
    } else {
      try {
        katex.render(this.tex.trim(), div, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        div.textContent = this.tex;
        div.classList.add("md-math-error");
      }
    }

    div.addEventListener("mousedown", (e) => {
      e.preventDefault();
      view.dispatch({
        selection: EditorSelection.cursor(this.from + 2),
        scrollIntoView: true,
      });
      view.focus();
    });

    return div;
  }

  ignoreEvent() {
    return false;
  }
}

// ─── Inline Math Widget ───────────────────────────────────────────────────────

class InlineMathWidget extends WidgetType {
  constructor(readonly tex: string) {
    super();
  }
  eq(other: InlineMathWidget) {
    return other.tex === this.tex;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "md-math-inline";
    try {
      katex.render(this.tex, span, { throwOnError: false, displayMode: false });
    } catch {
      span.textContent = `$${this.tex}$`;
      span.className = "md-math-error";
    }
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

// ─── Match collector ──────────────────────────────────────────────────────────

interface BlockMatch {
  kind: "block";
  from: number;
  to: number;
  tex: string;
}

interface InlineMatch {
  kind: "inline";
  from: number;
  to: number;
  tex: string;
}

type MathMatch = BlockMatch | InlineMatch;

function collectMathMatches(text: string): MathMatch[] {
  const matches: MathMatch[] = [];
  let i = 0;

  while (i < text.length) {
    // ── Block math: $$ ... $$ ─────────────────────────────────────────────
    if (text[i] === "$" && text[i + 1] === "$") {
      const openStart = i;
      const contentFrom = i + 2;
      i += 2;

      const closeIdx = text.indexOf("$$", i);
      if (closeIdx === -1) {
        i++;
        continue;
      }

      const fullTo = closeIdx + 2;
      const tex = text.slice(contentFrom, closeIdx);

      matches.push({
        kind: "block",
        from: openStart,
        to: fullTo,
        tex,
      });

      i = fullTo;
      continue;
    }

    // ── Inline math: $...$ ────────────────────────────────────────────────
    if (text[i] === "$") {
      const openStart = i;
      i += 1;

      if (
        i >= text.length ||
        text[i] === " " ||
        text[i] === "\n" ||
        text[i] === "\r"
      ) {
        continue;
      }

      let j = i;
      let found = false;
      while (j < text.length && text[j] !== "\n") {
        if (text[j] === "$") {
          if (text[j - 1] === " ") break;
          const inner = text.slice(i, j);
          if (inner.length > 0) {
            matches.push({
              kind: "inline",
              from: openStart,
              to: j + 1,
              tex: inner,
            });
            found = true;
            i = j + 1;
          }
          break;
        }
        j++;
      }
      if (!found) continue;
      continue;
    }

    i++;
  }

  return matches;
}

// ─── Decoration builder ───────────────────────────────────────────────────────

const hideMark = Decoration.mark({ class: "md-hide" });

function buildMathDecorations(state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = state.doc;
  const text = doc.toString();

  const matches = collectMathMatches(text);

  for (const match of matches) {
    if (match.kind === "block") {
      // Use cursorOnSameLine to reveal the block when cursor is anywhere inside it
      const cursorHere = cursorOnSameLine(match.from, match.to, state);

      if (!cursorHere) {
        // Replace the entire block (from opening $$ to closing $$) with the widget
        builder.add(
          match.from,
          match.to,
          Decoration.replace({
            widget: new BlockMathWidget(match.tex, match.from, match.to),
            block: true,
          }),
        );
      }
    } else {
      // Use cursorOverlaps for inline math (consistent with livePreviewPlugin)
      const cursorHere = cursorOverlaps(match.from, match.to, state);

      if (!cursorHere) {
        builder.add(
          match.from,
          match.to,
          Decoration.replace({ widget: new InlineMathWidget(match.tex) }),
        );
      }
    }
  }

  return builder.finish();
}

// ─── The exported StateField ──────────────────────────────────────────────────

export const mathField = StateField.define<DecorationSet>({
  create(state) {
    return buildMathDecorations(state);
  },
  update(decorations, transaction: Transaction) {
    if (transaction.docChanged || transaction.selection) {
      return buildMathDecorations(transaction.state);
    }
    return decorations.map(transaction.changes);
  },
  provide(field) {
    return EditorView.decorations.from(field);
  },
});
