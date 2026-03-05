import { WidgetType, EditorView } from "@codemirror/view";

export class CheckboxWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly from: number,
  ) {
    super();
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked;
  }

  toDOM(view: EditorView) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = this.checked;
    checkbox.className = "md-task-checkbox";
    checkbox.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const marker = view.state.doc.sliceString(this.from, this.from + 3);
      const newMarker = marker === "[ ]" ? "[x]" : "[ ]";
      view.dispatch({
        changes: { from: this.from, to: this.from + 3, insert: newMarker },
      });
    });
    return checkbox;
  }

  ignoreEvent() {
    return false;
  }
}
