import { Decoration, DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, EditorState } from "@codemirror/state";
import { cursorOverlaps, cursorOnSameLine } from "../../utils/cursorHelpers";
import { collectMathMatches } from "../../utils/mathParser";
import { BlockMathWidget } from "../widgets/BlockMathWidget";
import { InlineMathWidget } from "../widgets/InlineMathWidget";

export function buildMathDecorations(state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const text = state.doc.toString();
  const matches = collectMathMatches(text);

  for (const match of matches) {
    if (match.kind === "block") {
      const cursorHere = cursorOnSameLine(match.from, match.to, state);
      if (!cursorHere) {
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
