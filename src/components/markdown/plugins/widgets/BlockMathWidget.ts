import { WidgetType, EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import katex from "katex";

export class BlockMathWidget extends WidgetType {
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
