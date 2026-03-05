import { WidgetType } from "@codemirror/view";
import katex from "katex";

export class InlineMathWidget extends WidgetType {
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
