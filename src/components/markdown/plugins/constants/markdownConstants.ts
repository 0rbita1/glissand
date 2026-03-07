import { Decoration } from "@codemirror/view";

// ─── Flyweight mark decorations ───────────────────────────────────────────────

export const hide = Decoration.mark({ class: "md-hide" });
export const hideText = Decoration.mark({ class: "md-hide-text" });

export const bold = Decoration.mark({ class: "md-bold" });
export const italic = Decoration.mark({ class: "md-italic" });
export const strike = Decoration.mark({ class: "md-strike" });
export const code = Decoration.mark({ class: "md-code" });
export const codeBlock = Decoration.mark({ class: "md-codeblock" });
export const blockquote = Decoration.mark({ class: "md-blockquote" });
export const link = Decoration.mark({ class: "md-link" });
export const hrDeco = Decoration.mark({ class: "md-hr" });

export const tableRow = Decoration.mark({ class: "md-table-row" });
export const tableHead = Decoration.mark({ class: "md-table-head" });
export const listItem = Decoration.mark({ class: "md-list-item" });

// ─── Heading decorations ──────────────────────────────────────────────────────

export const headingDeco: Record<string, Decoration> = {
  ATXHeading1: Decoration.mark({ class: "md-h1" }),
  ATXHeading2: Decoration.mark({ class: "md-h2" }),
  ATXHeading3: Decoration.mark({ class: "md-h3" }),
  ATXHeading4: Decoration.mark({ class: "md-h4" }),
  ATXHeading5: Decoration.mark({ class: "md-h5" }),
  ATXHeading6: Decoration.mark({ class: "md-h6" }),
};

// ─── Node name sets / maps ────────────────────────────────────────────────────

/** Node names whose syntax characters should be hidden when cursor is away. */
export const SYNTAX_MARKS = new Set([
  "HeaderMark",
  "EmphasisMark",
  "StrikethroughMark",
  "LinkMark",
  "QuoteMark",
  "TableDelimiter",
  "TaskMarker",
]);

/** Node names that receive a content-level style over their full range. */
export const CONTENT_STYLES: Record<string, Decoration> = {
  StrongEmphasis: bold,
  Emphasis: italic,
  Strikethrough: strike,
  InlineCode: code,
  FencedCode: codeBlock,
  Blockquote: blockquote,
  Link: link,
  HorizontalRule: hrDeco,
};
