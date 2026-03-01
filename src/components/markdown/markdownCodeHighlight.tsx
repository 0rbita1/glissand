import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// GitHub Dark syntax highlighting theme
// Ref: https://github.com/primer/github-vscode-theme
const markdownCodeHighlight = HighlightStyle.define([
  // Keywords: if, for, return, import, export, etc.
  { tag: tags.keyword, color: "#ff7b72" },
  // Control flow: break, continue, return, yield
  { tag: tags.controlKeyword, color: "#ff7b72" },
  // Operators: +, ===, =>, etc.
  { tag: tags.operator, color: "#ff7b72" },
  // Strings: "hello", 'world', `template`
  { tag: tags.string, color: "#a5d6ff" },
  { tag: tags.special(tags.string), color: "#a5d6ff" },
  // Numbers: 42, 3.14
  { tag: tags.number, color: "#79c0ff" },
  // Booleans and null: true, false, null, undefined
  { tag: tags.bool, color: "#79c0ff" },
  { tag: tags.null, color: "#79c0ff" },
  // Comments: // and /* */
  { tag: tags.comment, color: "#8b949e", fontStyle: "italic" },
  { tag: tags.lineComment, color: "#8b949e", fontStyle: "italic" },
  { tag: tags.blockComment, color: "#8b949e", fontStyle: "italic" },
  // Function names at call/definition sites
  { tag: tags.function(tags.variableName), color: "#d2a8ff" },
  { tag: tags.function(tags.propertyName), color: "#d2a8ff" },
  // Variable names
  { tag: tags.variableName, color: "#ffa657" },
  { tag: tags.definition(tags.variableName), color: "#ffa657" },
  // Type names: string, number, MyClass
  { tag: tags.typeName, color: "#79c0ff" },
  { tag: tags.typeOperator, color: "#ff7b72" },
  // Class names
  { tag: tags.className, color: "#f0883e" },
  // Property / attribute names
  { tag: tags.propertyName, color: "#79c0ff" },
  { tag: tags.attributeName, color: "#79c0ff" },
  { tag: tags.attributeValue, color: "#a5d6ff" },
  // Punctuation: brackets, braces, etc.
  { tag: tags.punctuation, color: "#c9d1d9" },
  { tag: tags.bracket, color: "#c9d1d9" },
  // Tags (HTML/JSX)
  { tag: tags.tagName, color: "#7ee787" },
  { tag: tags.angleBracket, color: "#c9d1d9" },
  // Namespace / module names
  { tag: tags.namespace, color: "#ff7b72" },
  // Regexp
  { tag: tags.regexp, color: "#a5d6ff" },
  // Escape sequences inside strings
  { tag: tags.escape, color: "#79c0ff" },
  // Self / this
  { tag: tags.self, color: "#79c0ff" },
]);

export default markdownCodeHighlight;
