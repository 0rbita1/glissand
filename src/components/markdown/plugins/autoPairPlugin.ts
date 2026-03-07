// src/components/markdown/plugins/autoPairPlugin.ts
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";

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

/**
 * Closing characters eligible for skip-over: when the character immediately
 * after the cursor matches what was typed, advance the cursor instead of
 * inserting.
 */
const CLOSING_SET = new Set([")", "]", "}", '"', "'", "*", "`"]);

/**
 * A position counts as a word-free boundary when the character there is a
 * space, a newline, or the document edge (undefined).
 */
function isBoundary(ch: string | undefined): boolean {
  return ch === undefined || ch === " " || ch === "\n" || ch === "\r";
}

const autoPairHandler = EditorView.inputHandler.of((view, from, to, text) => {
  // Only intercept single-character insertions with no active selection.
  if (text.length !== 1 || from !== to) return false;

  const char = text;
  const state = view.state;
  const docLen = state.doc.length;

  const nextChar =
    from < docLen ? state.doc.sliceString(from, from + 1) : undefined;

  // Skip-over: if a closing char is typed and the same char already sits
  // immediately after the cursor (from a prior auto-pair), just advance.
  if (CLOSING_SET.has(char) && nextChar === char) {
    view.dispatch({
      selection: { anchor: from + 1 },
      userEvent: "input.autoPair.skip",
    });
    return true;
  }

  // Auto-pair: insert the closing half only when both neighbours are
  // boundaries (spaces, newlines, or document edges).
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

export const autoPairPlugin: Extension = autoPairHandler;
