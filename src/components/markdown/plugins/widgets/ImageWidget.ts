import { WidgetType } from "@codemirror/view";

export class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly alt: string,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt;
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = "md-image-widget";

    const img = document.createElement("img");
    img.src = this.src;
    img.alt = this.alt;
    img.className = "md-image";
    img.onerror = () => {
      img.style.display = "none";
      const err = document.createElement("span");
      err.className = "md-image-error";
      err.textContent = `⚠ Cannot load: ${this.alt || this.src}`;
      wrap.appendChild(err);
    };

    wrap.appendChild(img);
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}
