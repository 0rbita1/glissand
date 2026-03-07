import { DecorationSet, EditorView } from "@codemirror/view";
import { StateField, Transaction } from "@codemirror/state";
import { buildMathDecorations } from "./decorations/mathDecorations";

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
