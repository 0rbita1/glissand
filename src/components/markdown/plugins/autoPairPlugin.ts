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

  const nextChar =
    from < docLen ? state.doc.sliceString(from, from + 1) : undefined;

  if (CLOSING_SET.has(char) && nextChar === char) {
    view.dispatch({
      selection: { anchor: from + 1 },
      userEvent: "input.autoPair.skip",
    });
    return true;
  }

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

// Prec.high ensures this runs before defaultKeymap's deleteCharBackward.
// Without it, defaultKeymap consumes Backspace first and handleBackspace never fires.
const autoPairBackspace = Prec.high(
  keymap.of([{ key: "Backspace", run: handleBackspace }]),
);

export const autoPairPlugin: Extension = [autoPairHandler, autoPairBackspace];
