import {
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
  EditorView,
  WidgetType,
  Decoration,
} from "@codemirror/view";
import {
  RangeSetBuilder,
  StateEffect,
  EditorSelection,
} from "@codemirror/state";
import katex from "katex";

// ─── Cursor helpers ───────────────────────────────────────────────────────────

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

// ─── Block Math Widget (line widget rendered below syntax) ────────────────────

class BlockMathWidget extends WidgetType {
  constructor(
    readonly tex: string,
    // Position of content start (right after opening $$) and end (right before closing $$)
    readonly contentFrom: number,
    readonly contentTo: number,
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

    // Clicking the rendered widget moves cursor to start of content and selects it
    div.addEventListener("mousedown", (e) => {
      e.preventDefault();
      view.dispatch({
        selection: EditorSelection.range(this.contentFrom, this.contentTo),
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
  // Full extent of the $$ ... $$ syntax (for cursor-on-line check)
  from: number;
  to: number;
  // The position right after the opening $$ (content start) and right before closing $$
  contentFrom: number;
  contentTo: number;
  // Line at whose END we attach the preview widget
  widgetLine: number;
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

      // Find closing $$
      const closeIdx = text.indexOf("$$", i);
      if (closeIdx === -1) {
        i++;
        continue;
      }

      const contentTo = closeIdx;
      const fullTo = closeIdx + 2;
      const tex = text.slice(contentFrom, contentTo);

      // Widget attaches to the END of the last line of the syntax block
      // We find what line the closing $$ is on
      const closingLineStart = text.lastIndexOf("\n", closeIdx) + 1;
      // Count newlines up to closingLineStart to get line number (0-indexed)
      const widgetLine = (text.slice(0, closingLineStart).match(/\n/g) ?? [])
        .length;

      matches.push({
        kind: "block",
        from: openStart,
        to: fullTo,
        contentFrom,
        contentTo,
        widgetLine,
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

function buildMathDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  const text = doc.toString();

  const matches = collectMathMatches(text);

  for (const match of matches) {
    const cursorHere = cursorOnSameLine(match.from, match.to, view);

    if (match.kind === "block") {
      // Always add the line widget (real-time preview, always visible)
      // It attaches to the end of the closing $$ line
      const widgetLineObj = doc.line(match.widgetLine + 1); // doc.line is 1-indexed
      builder.add(
        widgetLineObj.to,
        widgetLineObj.to,
        Decoration.widget({
          widget: new BlockMathWidget(
            match.tex,
            match.contentFrom,
            match.contentTo,
          ),
          block: true,
          side: 1,
        }),
      );

      // Hide the syntax when cursor is away
      if (!cursorHere) {
        builder.add(match.from, match.to, hideMark);
      }
    } else {
      // Inline: replace with widget when cursor is away
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

// ─── The exported plugin ──────────────────────────────────────────────────────

export const mathPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildMathDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildMathDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);
