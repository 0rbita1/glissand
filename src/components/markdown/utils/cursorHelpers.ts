import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

function toState(stateOrView: EditorState | EditorView): EditorState {
  return "state" in stateOrView ? stateOrView.state : stateOrView;
}

/** Returns true if any cursor/selection overlaps the given character range. */
export function cursorOverlaps(
  from: number,
  to: number,
  stateOrView: EditorState | EditorView,
): boolean {
  const state = toState(stateOrView);
  for (const sel of state.selection.ranges) {
    if (sel.from <= to && sel.to >= from) return true;
  }
  return false;
}

/** Returns true if the cursor is on the same line as the given range. */
export function cursorOnSameLine(
  from: number,
  to: number,
  stateOrView: EditorState | EditorView,
): boolean {
  const state = toState(stateOrView);
  const doc = state.doc;
  const lineFrom = doc.lineAt(from).number;
  const lineTo = doc.lineAt(to).number;
  for (const sel of state.selection.ranges) {
    const cursorLine = doc.lineAt(sel.head).number;
    if (cursorLine >= lineFrom && cursorLine <= lineTo) return true;
  }
  return false;
}
