// src/components/markdown/plugins/autoPairPlugin.ts
import { EditorView, keymap } from "@codemirror/view";
import { Extension, Prec } from "@codemirror/state";

/** Maps each opening character to its closing counterpart. */
const OPENING_MAP: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "*": "*",
  "`": "`",
};

const CLOSING_SET = new Set([")", "]", "}", '"', "'", "*", "`"]);

function isBoundary(ch: string | undefined): boolean {
  return ch === undefined || ch === " " || ch === "\n" || ch === "\r";
}

const autoPairHandler = EditorView.inputHandler.of((view, from, to, text) => {
  if (text.length !== 1 || from !== to) return false;

  const char = text;
  const state = view.state;
  const docLen = state.doc.length;

  // --- Multi-char pair: ``` → ```\n\n``` ---
  if (
    char === "`" &&
    from >= 2 &&
    state.doc.sliceString(from - 2, from) === "``"
  ) {
    const outerPrev =
      from > 2 ? state.doc.sliceString(from - 3, from - 2) : undefined;
    const charAfter =
      from < docLen ? state.doc.sliceString(from, from + 1) : undefined;

    if (isBoundary(outerPrev) && isBoundary(charAfter)) {
      view.dispatch({
        changes: { from, to, insert: "`\n\n```" },
        selection: { anchor: from + 2 },
        userEvent: "input.autoPair",
      });
      return true;
    }
  }

  // --- Multi-char pair: $$ → $$\n\n$$ ---
  if (
    char === "$" &&
    from >= 1 &&
    state.doc.sliceString(from - 1, from) === "$"
  ) {
    const outerPrev =
      from > 1 ? state.doc.sliceString(from - 2, from - 1) : undefined;
    const charAfter =
      from < docLen ? state.doc.sliceString(from, from + 1) : undefined;

    if (isBoundary(outerPrev) && isBoundary(charAfter)) {
      view.dispatch({
        changes: { from, to, insert: "$\n\n$$" },
        selection: { anchor: from + 2 },
        userEvent: "input.autoPair",
      });
      return true;
    }
  }

  // --- Single-char logic ---
  const nextChar =
    from < docLen ? state.doc.sliceString(from, from + 1) : undefined;

  // Skip-over: advance past a matching auto-inserted closing character.
  if (CLOSING_SET.has(char) && nextChar === char) {
    view.dispatch({
      selection: { anchor: from + 1 },
      userEvent: "input.autoPair.skip",
    });
    return true;
  }

  // Auto-pair: only when both neighbours are boundaries.
  if (char in OPENING_MAP) {
    const prevChar =
      from > 0 ? state.doc.sliceString(from - 1, from) : undefined;

    if (isBoundary(prevChar) && isBoundary(nextChar)) {
      view.dispatch({
        changes: { from, to, insert: char + OPENING_MAP[char] },
        selection: { anchor: from + 1 },
        userEvent: "input.autoPair",
      });
      return true;
    }
  }

  return false;
});

function handleBackspace(view: EditorView): boolean {
  const state = view.state;
  const sel = state.selection.main;

  if (!sel.empty) return false;

  const pos = sel.from;
  const docLen = state.doc.length;

  if (pos < 1 || pos >= docLen) return false;

  const prevChar = state.doc.sliceString(pos - 1, pos);
  const nextChar = state.doc.sliceString(pos, pos + 1);

  if (!(prevChar in OPENING_MAP) || OPENING_MAP[prevChar] !== nextChar)
    return false;

  const outerPrev =
    pos > 1 ? state.doc.sliceString(pos - 2, pos - 1) : undefined;
  const outerNext =
    pos + 1 < docLen ? state.doc.sliceString(pos + 1, pos + 2) : undefined;

  if (!isBoundary(outerPrev) || !isBoundary(outerNext)) return false;

  view.dispatch({
    changes: { from: pos - 1, to: pos + 1 },
    userEvent: "delete.autoPair",
  });
  return true;
}

const autoPairBackspace = Prec.high(
  keymap.of([{ key: "Backspace", run: handleBackspace }]),
);

export const autoPairPlugin: Extension = [autoPairHandler, autoPairBackspace];
